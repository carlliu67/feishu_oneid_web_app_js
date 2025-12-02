import serverConfig from '../config/server_config.js';
import lark from '@larksuiteoapi/node-sdk';
import axios from 'axios';
import { logger } from '../util/logger.js';
import { genH5AppLinkMeetingCode } from './feishuUtil.js';
import { client } from './feishuClient.js';

// 获取 tenant_access_token
async function getTenantAccessToken() {
    try {
        const response = await axios.post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
            "app_id": serverConfig.feishuAppId,
            "app_secret": serverConfig.feishuAppSecret
        }, { headers: { "Content-Type": "application/json" } });

        if (response.data.code === 0) {
            return response.data.tenant_access_token;
        } else {
            logger.error('获取 tenant_access_token 失败:', response.data.msg);
            return null;
        }
    } catch (error) {
        logger.error('请求 tenant_access_token 时出错:', error);
        return null;
    }
}

// 查询日历列表
async function getCalendarList(tenant_access_token) {
    try {
        const res = await client.calendar.v4.calendar.list({
            params: {
                page_size: 500,
            },
        },
            lark.withTenantToken(tenant_access_token)
        );

        return res.data.calendar_list;
    } catch (e) {
        logger.error(JSON.stringify(e.response, null, 4));
        throw e; // 抛出错误以便调用者处理
    }
}

// 获取应用主日历ID
function getPrimaryCalendarId(calendar_list) {
    const data = Array.from(calendar_list);
    const targetElement = data.find(item => item.summary === serverConfig.feishuAppName && item.type === 'primary');
    const calendarId = targetElement ? targetElement.calendar_id : null;
    return calendarId;
}

// 创建日程
async function createCalendar(tenant_access_token, calendar_id, meetingInfo) {
    try {
        const meeting_url = genH5AppLinkMeetingCode(meetingInfo.meeting_code);
        const res = await client.calendar.v4.calendarEvent.create({
            path: {
                calendar_id: calendar_id,
            },
            params: {
                user_id_type: 'user_id',
            },
            data: {
                summary: meetingInfo.subject,
                start_time: {
                    timestamp: meetingInfo.start_time,
                },
                end_time: {
                    timestamp: meetingInfo.end_time,
                },
                vchat: {
                    vc_type: 'third_party',
                    description: '加入视频会议',
                    meeting_url: meeting_url,
                },
            },
        },
        lark.withTenantToken(tenant_access_token)
        );
        logger.info(res);
        return res.data.event.event_id; // 可以根据需求返回结果
    } catch (e) {
        logger.error(JSON.stringify(e.response.data, null, 4));
        throw e; // 抛出错误，让调用者处理
    }
}

// 增加日程参与人
async function addCalendarAttendees(tenant_access_token, calendar_id, event_id, attendees) {
    // var currentHosts = meetingInfo.current_hosts? meetingInfo.current_hosts : [];
    // var hosts = meetingInfo.hosts? meetingInfo.hosts : [];
    // var participants = meetingInfo.participants? meetingInfo.participants : [];
    // var attendees = [];
    // if (currentHosts.length > 0) {
    //     for (const host of currentHosts) {
    //         attendees.push({
    //             type: 'user',
    //             is_optional: true,
    //             user_id: host.userid,
    //             approval_reason: '创建会议时自动添加',
    //         });
    //     }
    // }
    // if (hosts.length > 0) {
    //     for (const host of hosts) {
    //         attendees.push({
    //             type: 'user',
    //             is_optional: true,
    //             user_id: host.userid,
    //             approval_reason: '创建会议时自动添加',
    //         });
    //     }
    // }
    // if (participants.length > 0) {
    //     for (const paticipant of participants) {
    //         attendees.push({
    //             type: 'user',
    //             is_optional: true,
    //             user_id: paticipant.userid,
    //             approval_reason: '创建会议时自动添加',
    //         });
    //     }
    // }
    // logger.info("currentHosts: ", currentHosts);
    // logger.info("hosts: ", hosts);
    // logger.info("paticipants: ", participants);
    // logger.info("attendees: ", attendees);
    
    try {
        const res = await client.calendar.v4.calendarEventAttendee.create({
            path: {
                calendar_id: calendar_id,
                event_id: event_id,
            },
            params: {
                user_id_type: 'user_id',
            },
            data: {
                attendees: attendees,
            },
        },
        lark.withTenantToken(tenant_access_token)
        );
        logger.info(res);
        return res.code;
    } catch (e) {
        logger.error(JSON.stringify(e.response, null, 4));
        throw e;
    }
}

// 创建会议日程
async function createMeetingCalendar(meetingInfo, attendees) {
    const tenant_access_token = await getTenantAccessToken();
    const calendar_list = await getCalendarList(tenant_access_token);
    logger.debug("calendar_list: ", calendar_list);
    const calendarId = getPrimaryCalendarId(Array.from(calendar_list));
    logger.info(calendarId);
    const event_id = await createCalendar(tenant_access_token, calendarId, meetingInfo);
    const status = await addCalendarAttendees(tenant_access_token, calendarId, event_id, attendees);
    if (status === 0) {
        logger.info("添加日程参与人成功");
    }
}

export {
    createMeetingCalendar, getTenantAccessToken
};
import serverConfig from '../config/server_config.js';
import lark from '@larksuiteoapi/node-sdk';
import { logger } from '../util/logger.js';
import { genH5AppLinkMeetingCode, getTenantAccessToken } from './feishuUtil.js';
import { client } from './feishuClient.js';
import dbAdapter from '../db/db_adapter.js';

// 从适配器获取数据库方法
const { dbInsertCalendar, dbDeleteCalendarByMeetingid, dbGetCalendarEventId, dbUpdateCalendar } = dbAdapter;

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

// 删除日程参与人
async function deleteCalendarAttendees(tenant_access_token, calendar_id, event_id, attendees) {    
    try {
        const res = await client.calendar.v4.calendarEventAttendee.batchDelete({
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

// 获取日程参与人
async function getCalendarAttendees(tenant_access_token, calendar_id, event_id) {    
    try {
        const res = await client.calendar.v4.calendarEventAttendee.list({
            path: {
                calendar_id: calendar_id,
                event_id: event_id,
            },
            params: {
                user_id_type: 'user_id',
            },
        },
        lark.withTenantToken(tenant_access_token)
        );
        logger.info(res);
        return res.data.attendees || [];
    } catch (e) {
        logger.error(JSON.stringify(e.response, null, 4));
        throw e;
    }
}

// 更新日程基本信息
async function updateCalendarEvent(tenant_access_token, calendar_id, event_id, meetingInfo) {    
    try {
        const meeting_url = genH5AppLinkMeetingCode(meetingInfo.meeting_code);
        const res = await client.calendar.v4.calendarEvent.patch({
            path: {
                calendar_id: calendar_id,
                event_id: event_id,
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
        return res.code;
    } catch (e) {
        logger.error(JSON.stringify(e.response.data, null, 4));
        throw e;
    }
}

// 删除飞书日历事件
async function deleteCalendarEvent(tenant_access_token, calendar_id, event_id) {    
    try {
        const res = await client.calendar.v4.calendarEvent.delete({
            path: {
                calendar_id: calendar_id,
                event_id: event_id,
            },
            params: {
                user_id_type: 'user_id',
            },
        },
        lark.withTenantToken(tenant_access_token)
        );
        logger.info(res);
        return res.code;
    } catch (e) {
        logger.error(JSON.stringify(e.response.data, null, 4));
        throw e;
    }
}

/**
 * 将用户ID数组转换为飞书日历事件参与者格式
 * @param {string[]} userIds - 用户ID数组
 * @returns {Array<{type: string, user_id: string}>} - 转换后的参与者数组
 */
function convertToParticipants(userIds) {
  if (!Array.isArray(userIds)) {
    throw new Error('入参必须是数组');
  }
  
  return userIds.map(userId => ({
    type: "user",
    user_id: userId
  }));
}

// 创建会议日程
async function createMeetingCalendar(creatorUserId, meetingInfo, attendees) {
    const tenant_access_token = await getTenantAccessToken();
    const calendar_list = await getCalendarList(tenant_access_token);
    logger.debug("calendar_list: ", calendar_list);
    const calendarId = getPrimaryCalendarId(Array.from(calendar_list));
    logger.debug("calendarId: ", calendarId);
    const event_id = await createCalendar(tenant_access_token, calendarId, meetingInfo);
    const status = await addCalendarAttendees(tenant_access_token, calendarId, event_id, convertToParticipants(attendees));
    if (status === 0) {
        await dbInsertCalendar(meetingInfo.meeting_id, calendarId, event_id, creatorUserId, meetingInfo.start_time);
        logger.debug("添加日程参与人成功");
    }
}

// 更新会议日程
async function updateMeetingCalendar(creatorUserid, meetingInfo, participants) {
    try {
        const tenant_access_token = await getTenantAccessToken();
        const calendar_list = await getCalendarList(tenant_access_token);
        logger.debug("calendar_list: ", calendar_list);
        const calendarId = getPrimaryCalendarId(Array.from(calendar_list));
        logger.debug("calendarId: ", calendarId);
        const event_id = await dbGetCalendarEventId(meetingInfo.meeting_id);
        
        if (!event_id) {
            logger.error("未找到会议对应的日历事件ID");
            return;
        }
        
        // 更新日程基本信息
        const updateStatus = await updateCalendarEvent(tenant_access_token, calendarId, event_id, meetingInfo);
        if (updateStatus === 0) {
            logger.debug("更新日程基本信息成功");
        }
        
        // 处理参与人变化
        if (participants && Array.isArray(participants)) {

            // 获取当前参与人列表
            const currentAttendees = await getCalendarAttendees(tenant_access_token, calendarId, event_id);
            const currentAttendeeIds = currentAttendees.map(attendee => attendee.user_id);
            
            // 新参与人列表ID
            const newAttendeeIds = participants;
            
            // 找出需要删除的参与人
            const toDelete = currentAttendeeIds.filter(id => !newAttendeeIds.includes(id));
            // 找出需要添加的参与人
            const toAdd = newAttendeeIds.filter(id => !currentAttendeeIds.includes(id));

            
            // 删除不需要的参与人
            if (toDelete.length > 0) {
                const deleteAttendees = toDelete.map(id => ({ type: "user", user_id: id }));
                const deleteStatus = await deleteCalendarAttendees(tenant_access_token, calendarId, event_id, deleteAttendees);
                if (deleteStatus === 0) {
                    logger.debug("删除日程参与人成功");
                }
            }
            
            // 添加新的参与人
            if (toAdd.length > 0) {
                const addAttendees = toAdd.map(id => ({ type: "user", user_id: id }));
                const addStatus = await addCalendarAttendees(tenant_access_token, calendarId, event_id, addAttendees);
                if (addStatus === 0) {
                    logger.debug("添加日程参与人成功");
                }
            }
        }
        
        // 更新数据库中的日历信息
        await dbUpdateCalendar(meetingInfo.meeting_id, calendarId, event_id, creatorUserid, meetingInfo.start_time);
        logger.debug("更新会议日程成功");
    } catch (error) {
        logger.error("更新会议日程失败:", error);
        throw error;
    }
}

// 删除会议日程
async function deleteMeetingCalendar(meetingId) {
    try {
        const tenant_access_token = await getTenantAccessToken();
        const calendar_list = await getCalendarList(tenant_access_token);
        logger.debug("calendar_list: ", calendar_list);
        const calendarId = getPrimaryCalendarId(Array.from(calendar_list));
        logger.debug("calendarId: ", calendarId);
        
        // 获取日历事件ID
        const event_id = await dbGetCalendarEventId(meetingId);
        
        if (!event_id) {
            logger.error("未找到会议对应的日历事件ID");
            return;
        }
        
        // 删除飞书日历事件
        const deleteStatus = await deleteCalendarEvent(tenant_access_token, calendarId, event_id);
        if (deleteStatus === 0) {
            logger.debug("删除飞书日历事件成功");
        }
        
        // 删除数据库中的日历记录
        await dbDeleteCalendarByMeetingid(meetingId);
        logger.debug("删除数据库中的日历记录成功");
        
        logger.debug("删除会议日程成功");
    } catch (error) {
        logger.error("删除会议日程失败:", error);
        throw error;
    }
}

export {
    createMeetingCalendar, 
    updateMeetingCalendar,
    deleteMeetingCalendar,
    getTenantAccessToken
};
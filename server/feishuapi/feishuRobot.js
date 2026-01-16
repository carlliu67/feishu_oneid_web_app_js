import lark from '@larksuiteoapi/node-sdk';

import { logger } from '../util/logger.js';
import { genH5AppLinkMeetingCode, genH5AppLinkMeetingUrl } from './feishuUtil.js';
import { getTenantAccessToken } from './feishuUtil.js';
import { client } from './feishuClient.js';

// 发送会议卡片消息
async function sendMeetingInfoCardMessage(receive_id, createrName, meetingInfo) {
    var tenant_access_token = await getTenantAccessToken();;
    var startTime = meetingInfo.startTime;
    var endTime = meetingInfo.endTime;
    // var jumpUrl = "https://applink.feishu.cn/client/web_url/open?mode=appCenter&reload=false&url=http%3A%2F%2Fss.liuqi92.cn%3A3000%3FmeetingCode%3D854576960";
    var jumpUrl = genH5AppLinkMeetingCode(meetingInfo.meeting_code);
    var msg ={
        "schema": "2.0",
        "config": {
            "update_multi": true,
            "locales": [
                "en_us"
            ],
            "style": {
                "text_size": {
                    "normal_v2": {
                        "default": "normal",
                        "pc": "normal",
                        "mobile": "heading"
                    }
                }
            }
        },
        "body": {
                "direction": "vertical",
                "padding": "12px 12px 12px 12px",
                "elements": [
                    {
                        "tag": "markdown",
                        "content": "腾讯会议参会链接：\nhttps://meeting.tencent.com/dm/WvrYC8kzGU0N\n\n#腾讯会议：" + meetingInfo.meeting_code + "\n\n发起人 " + createrName + "\n\n参会人 ",
                        "i18n_content": {
                            "en_us": "👋 <at id=\"${open_id}\"></at> Hello, ready to explore our **Bot Card Interaction Guide**? 🤖\n\nThis tutorial uses \"Alert System\" as an example to help you understand:\n- Creating your first interactive card\n- Setting up interactive buttons on your card\n- Customizing your bot's menu options"
                        },
                        "text_align": "left",
                        "text_size": "normal_v2",
                        "margin": "0px 0px 0px 0px"
                    },
                    {
                        "tag": "hr",
                        "margin": "0px 0px 0px 0px"
                    },
                    {
                        "tag": "column_set",
                        "horizontal_align": "left",
                        "columns": [
                            {
                                "tag": "column",
                                "width": "weighted",
                                "elements": [
                                    {
                                        "tag": "button",
                                        "text": {
                                            "tag": "plain_text",
                                            "content": "加入会议",
                                            "i18n_content": {
                                                "en_us": "View Tutorial"
                                            }
                                        },
                                        "type": "primary_filled",
                                        "width": "default",
                                        "size": "medium",
                                        "behaviors": [
                                            {
                                                "type": "open_url",
                                                "default_url": jumpUrl,
                                                "pc_url": "",
                                                "ios_url": "",
                                                "android_url": ""
                                            }
                                        ]
                                    }
                                ],
                                "direction": "horizontal",
                                "horizontal_spacing": "8px",
                                "vertical_spacing": "8px",
                                "horizontal_align": "left",
                                "vertical_align": "top",
                                "weight": 1
                            }
                        ],
                        "margin": "0px 0px 0px 0px"
                    }
                ]
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": "【会议提醒】" + meetingInfo.subject,
                    "i18n_content": {
                        "en_us": "👋 Dive into Bot Card Interactions: A Hands-on Tutorial"
                    }
                },
                "subtitle": {
                    "tag": "plain_text",
                    "content": "会议时间：2025年XX月XX日 10:00 - 11:00"
                },
                "template": "blue",
                "padding": "12px 12px 12px 12px"
            }
    }

    logger.info("sendMeetingInfoCardMessage: ", JSON.stringify(msg));

    client.im.v1.message.create({
        params: {
            receive_id_type: 'user_id',
        },
        data: {
            receive_id: receive_id,
            msg_type: 'interactive',
            content: JSON.stringify(msg),
        },
    },
        lark.withTenantToken(tenant_access_token)
    ).then(res => {
        logger.info("sendCardMessage result: ", res);
    }).catch(e => {
        logger.error(JSON.stringify(e.response.data, null, 4));
    });
}

// 发送云录制卡片消息
async function sendRecordViewAddressCardMessage(receive_id, createrName, webhookMeetingInfo, recordViewAddress) {
    var tenant_access_token = await getTenantAccessToken();;
    var startTime = webhookMeetingInfo.start_time;
    var endTime = webhookMeetingInfo.end_time;
    // var jumpUrl = "https://applink.feishu.cn/client/web_url/open?mode=appCenter&reload=false&url=http%3A%2F%2Fss.liuqi92.cn%3A3000%3FmeetingCode%3D854576960";
    var jumpUrl = genH5AppLinkMeetingUrl(recordViewAddress);
    var msg ={
        "schema": "2.0",
        "config": {
            "update_multi": true,
            "locales": [
                "en_us"
            ],
            "style": {
                "text_size": {
                    "normal_v2": {
                        "default": "normal",
                        "pc": "normal",
                        "mobile": "heading"
                    }
                }
            }
        },
        "body": {
                "direction": "vertical",
                "padding": "12px 12px 12px 12px",
                "elements": [
                    {
                        "tag": "markdown",
                        "content": "云录制地址：\n" + recordViewAddress + "\n\n#腾讯会议：" + webhookMeetingInfo.meeting_code + "\n\n发起人 " + createrName,
                        "i18n_content": {
                            "en_us": "👋 <at id=\"${open_id}\"></at> Hello, ready to explore our **Bot Card Interaction Guide**? 🤖\n\nThis tutorial uses \"Alert System\" as an example to help you understand:\n- Creating your first interactive card\n- Setting up interactive buttons on your card\n- Customizing your bot's menu options"
                        },
                        "text_align": "left",
                        "text_size": "normal_v2",
                        "margin": "0px 0px 0px 0px"
                    },
                    {
                        "tag": "hr",
                        "margin": "0px 0px 0px 0px"
                    },
                    {
                        "tag": "column_set",
                        "horizontal_align": "left",
                        "columns": [
                            {
                                "tag": "column",
                                "width": "weighted",
                                "elements": [
                                    {
                                        "tag": "button",
                                        "text": {
                                            "tag": "plain_text",
                                            "content": "点击查看云录制",
                                            "i18n_content": {
                                                "en_us": "View Tutorial"
                                            }
                                        },
                                        "type": "primary_filled",
                                        "width": "default",
                                        "size": "medium",
                                        "behaviors": [
                                            {
                                                "type": "open_url",
                                                "default_url": jumpUrl,
                                                "pc_url": "",
                                                "ios_url": "",
                                                "android_url": ""
                                            }
                                        ]
                                    }
                                ],
                                "direction": "horizontal",
                                "horizontal_spacing": "8px",
                                "vertical_spacing": "8px",
                                "horizontal_align": "left",
                                "vertical_align": "top",
                                "weight": 1
                            }
                        ],
                        "margin": "0px 0px 0px 0px"
                    }
                ]
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": "【录制文件已生成】" + webhookMeetingInfo.subject,
                    "i18n_content": {
                        "en_us": "👋 Dive into Bot Card Interactions: A Hands-on Tutorial"
                    }
                },
                "subtitle": {
                    "tag": "plain_text",
                    "content": "会议时间：2025年XX月XX日 10:00 - 11:00"
                },
                "template": "blue",
                "padding": "12px 12px 12px 12px"
            }
    }

    logger.info("sendRecordViewAddressCardMessage: ", JSON.stringify(msg));

    client.im.v1.message.create({
        params: {
            receive_id_type: 'user_id',
        },
        data: {
            receive_id: receive_id,
            msg_type: 'interactive',
            content: JSON.stringify(msg),
        },
    },
        lark.withTenantToken(tenant_access_token)
    ).then(res => {
        logger.info("sendCardMessage result: ", res);
    }).catch(e => {
        logger.error(JSON.stringify(e.response.data, null, 4));
    });
}

export {
    sendMeetingInfoCardMessage,
    sendRecordViewAddressCardMessage
};
import serverConfig from '../config/server_config.js';
import lark from '@larksuiteoapi/node-sdk';
import axios from 'axios';
import { logger } from '../util/logger.js';
import { genH5AppLinkMeetingCode } from './feishuUtil.js';
import { client } from './feishuClient.js';

async function createMeetingTask(creatorUserid, meetingInfo, todoParticipants) {
    logger.debug("createMeetingTask: ", creatorUserid, meetingInfo, todoParticipants);
    return
}

export {
    createMeetingTask
};
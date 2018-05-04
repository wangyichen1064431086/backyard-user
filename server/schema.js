const Joi = require('joi');

const keys = {
  email: Joi.string().trim().email().min(3).max(30).required(),//邮箱限制规则
  password: Joi.string().trim().min(8).max(20).required()//密码限制规则
};

exports.changePassword = Joi.object().keys({
  currentPassword: keys.password,
  password: keys.password,
  passwordConfirmation: keys.password
})//changePassword这条模式规定了：currentPassword、password、passwordConfirmation三个属性都需要满足密码限制规则

exports.cmsAuth = Joi.object().keys({
  name: Joi.string().trim().min(3).max(30).required(),
  password: keys.password
})//cmsAuth这条模式规定了:name属性要满足为长度在3-30的字符串，必填项；password满足密码限制规则。

exports.ftcAuth = Joi.object().keys({
  email: keys.email,
  password: keys.password
});//ftcAuth这条模式规定了：email属性要满足邮箱限制规则;password属性要满足密码限制规则

exports.reset = Joi.object().keys({
  password: keys.password,
  passwordConfirmation: keys.password
});//reset这条模式规定了：password属性和passwordConfirmation属性都要满足邮箱限制规则


/**
 * @param {Object} err
 * @param {boolean} err.isJoi
 * @param {string} err.name=ValidationError
 * @param {Object[]} err.details
 * @param {string} err.details.message
 * @param {string[]} err.details.path
 * @param {string} err.details.type
 * @param {Object} err.details.context
 * @param {number} err.details.context.limit
 * @param {number} err.details.context.value
 * @param {string} err.details.context.key
 * @param {string} err.details.context.label
 * @return {Object}
 */
//这些err的API全部是joi官方文档给出的err API
exports.gatherErrors = function (err) {
  if (!err.isJoi || err.name !== 'ValidationError') {
    return null;
  }

  return err.details.reduce((acc, cur) => {
    acc[cur.context.key] = cur.message;
    return acc;
  }, {});
};

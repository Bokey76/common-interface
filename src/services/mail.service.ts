import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// 连接邮箱服务
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * 渲染生成邮件模板，将数据注入模板，生成html
 * @param templateName 邮件模板名称，在src/templates/mail下
 * @param data 邮件模板需要的数据{}
 * @returns 返回邮件模板的html
 */
export const renderTemplate = (templateName: string, data: Record<string, any>) => {
  const filePath = path.join(__dirname, '../templates/mail', `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, 'utf-8');
  const template = Handlebars.compile(source);
  return template(data);
};

/**
 * 发送邮件
 * @param to 收件人邮箱
 * @param subject 邮件主题
 * @param html HTML 格式的内容
 */
export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({
    from: `"${process.env.SMTP_USER_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

const UAParser = require('ua-parser-js');

// 解析用户代理字符串
exports.parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || (result.device.vendor ? `${result.device.vendor} ${result.device.model}` : 'desktop')
  };
};
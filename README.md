# websocket-chat

## 使用到的技术栈
1. **express**：负责处理静态资源和普通页面请求；
2. **http**：负责监听所有的客户端请求；
3. **ws**：负责处理`websocket`类型的请求和响应；
4. **moment**：负责格式化日期；
5. **escape-goat**：负责对发送过来的`用户名`和`消息`进行转码，防止出现`xss`跨站脚本攻击；
6. 此外还用了`jquery`和`bootstrap`。
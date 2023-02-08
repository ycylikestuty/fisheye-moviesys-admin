module.exports = {
    devServer: {
        host: "localhost",  //指定host
        port: 8200,   //指定端口
        hotOnly: false, //启用热模块替换，而无需页面刷新作为构建失败时的回退。
    },
};


```cmd
:: 设置微软 internet 时钟服务
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /update

:: 腾讯 Internet 时钟服务
w32tm /config /manualpeerlist:"ntp.tencent.com" /syncfromflags:manual /update
```
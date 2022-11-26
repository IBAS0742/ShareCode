- 读取文件全部内容

```go
func ReadAll(filename string) string {
	f, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println("read fail", err)
	}
	return string(f)
}
```

- 将(byte/[]byte(string))内容写入到文件中

```go
func WriteWithIOUtilByte(name string, data []byte) {
	if ioutil.WriteFile(name, data, 0644) == nil {
		//fmt.Println("写入文件成功:")
	}
}
```
- 迭代处理文件夹内的文件

```go
// IterateDirAndFile
//* 迭代处理路径下的文件
//* dirPath 要处理的路径
//* dear(是否为文件夹,全路径)
//* subDir 是否扫描子文件夹
func IterateDirAndFile(dirPath string,dear func(isDir bool,fullPath string),subDir bool) {
	fList, e := ioutil.ReadDir(dirPath)
	if e != nil {
		fmt.Println("read ", dirPath)
	}
	for _, f := range fList {
		dear(f.IsDir(),path.Join(dirPath,f.Name()))
		if subDir && f.IsDir() {
			IterateDirAndFile(path.Join(dirPath,f.Name()),dear,subDir)
		}
	}
}
```


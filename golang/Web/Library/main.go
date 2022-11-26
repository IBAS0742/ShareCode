package main

import (
	"encoding/json"
	"fmt"
	"go-geo/Utils"
	"os"
	"path"
	"strings"
	"time"
)

type config struct {
	Name    string // 可以有任何符号
	Path    string
	Version string
	Alis    string // 必须是 go 语法认可的变量名格式，第一个字符必须是字母
}

var setting []config
var timeString = ""

// todo : 修改这里的路径 和 包引用路径
var libraryPath = "D:\\codes\\go-geo\\Web\\Library"
var packagePath = "go-geo/Web/Library/output"

func main() {
	setTimeString()
	var settingJsonPath = path.Join(libraryPath, "setting.json")
	// err := json.Unmarshal([]byte(strings.Join(DirAndFile.ReadAsFileAsLine(configPath), "\n")), &_config)
	json.Unmarshal([]byte(strings.Join(Utils.ReadAsFileAsLine(settingJsonPath), "\n")), &setting)
	fmt.Println(setting)

	// 判断 output 文件是否存在，不存在则创建
	var outputPath = path.Join(libraryPath, "output")
	checkAndCreateDir(outputPath)

	runStatic(libraryPath)
	buildAimportFile(outputPath)
}
func setTimeString() {
	now := time.Now()
	year := now.Year()
	month := now.Month()
	day := now.Day()
	hour := now.Hour()
	minute := now.Minute()
	second := now.Second()
	//fmt.Sprintf("now is %v,day is %v,minute is %v,month is %v,year is %v\n", now, day, minute, month, year)
	timeString = fmt.Sprintf("Create time : %02d-%02d-%02d  %02d:%02d:%02d", year, month, day, hour, minute, second)
}

var emptyArgs = []string{}

func checkAndCreateDir(p string) {
	if t, _ := Utils.PathExistsAndType(p); t == 0 {
		os.Mkdir(p, os.ModeDir)
	}
}
func runStatic(libraryPath string) {
	cmds := []string{
		libraryPath[0:2],
		"cd \"" + libraryPath + "\"",
	}
	for _, c := range setting {
		cmds = append(cmds, "statik -f -src=Src/"+c.Name+" -dest ./output -p "+c.Alis)
	}
	cmds = append(cmds, "exit")
	cmds = append(cmds, "del "+path.Join(libraryPath, "tmp.bat"))
	Utils.WriteWithIOUtilByte(path.Join(libraryPath, "tmp.bat"), []byte(strings.Join(cmds, "\r\n")))
	Utils.RunBatFile(path.Join(libraryPath, "tmp.bat"))
}

var tpl = `package {configName}

import (
	fs "github.com/rakyll/statik/fs"
	_ "{packagePath}/{configName}"
)

// {configName} @auth IBAS
// {ts}
// {configVersion}
var FS, _ = fs.New()
`
var aImportTpl = `package Aimport

import (
	//"go-geo/Web/Library/output/Aimport/leaflet171"
	{librarys}
	"net/http"
)

// Import @auth IBAS
// {ts}
func Import() {
	//http.Handle("/leaflet171/", http.StripPrefix("/leaflet171/", http.FileServer(leaflet171.FS)))
	{httpHandles}
}
`

func buildAimportFile(outputPath string) {
	//	├─output （下面的 static.go 是 runStatic 函数创建的）
	//	│  ├─setting[0].Alis
	//	│  │      statik.go
	//	│  │
	//	│  ├─setting[1].Alis
	//	│  │      statik.go
	//	│  │
	//	│  ├─setting[N].Alis
	//	│  │      statik.go
	//	│  │
	//	│  └─Aimport (现在构建的是这部分)
	//	│      │  a_import.go
	//	│      │
	//	│      ├─setting[0].Alis
	//	│      │      setting[0].Alis.go
	//	│      │
	//	│      └─setting[1].Name
	//	│              setting[1].Alis.go
	var aImportPath = path.Join(outputPath, "Aimport")
	checkAndCreateDir(aImportPath)
	var aImportFilePath = path.Join(aImportPath, "a_import.go")
	var librarys = []string{}
	var httpHandles = []string{}

	for _, c := range setting {
		cPath := path.Join(aImportPath, c.Alis)
		cFilePath := path.Join(cPath, c.Alis+".go")
		checkAndCreateDir(cPath)
		copyTpl := tpl
		copyTpl = strings.Replace(copyTpl, "{configName}", c.Alis, -1)
		copyTpl = strings.Replace(copyTpl, "{packagePath}", packagePath, -1)
		copyTpl = strings.Replace(copyTpl, "{configVersion}", c.Version, -1)
		copyTpl = strings.Replace(copyTpl, "{ts}", timeString, -1)
		Utils.WriteWithIOUtilByte(cFilePath, []byte(copyTpl))
		librarys = append(librarys, "\""+packagePath+"/Aimport/"+c.Alis+"\"")
		httpHandles = append(httpHandles, "http.Handle(\"/"+c.Path+"/\", http.StripPrefix(\"/"+c.Path+"/\", http.FileServer("+c.Alis+".FS)))")
	}

	aImportTpl = strings.Replace(aImportTpl, "{librarys}", strings.Join(librarys, "\r\n\t"), -1)
	aImportTpl = strings.Replace(aImportTpl, "{httpHandles}", strings.Join(httpHandles, "\r\n\t"), -1)
	aImportTpl = strings.Replace(aImportTpl, "{ts}", timeString, -1)
	Utils.WriteWithIOUtilByte(aImportFilePath, []byte(aImportTpl))
}

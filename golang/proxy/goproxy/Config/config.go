package Config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
)

const (
	CheckUrlTypeLua        = 0 //	使用 lua 匹配
	CheckUrlTypeContain    = 1 // 	包含 匹配
	CheckUrlTypeStartsWith = 2 //	开头匹配
	CheckUrlTypeEndsWith   = 3 //	结尾匹配
	CheckUrlTypeMatch      = 4 //	完全匹配
)
const (
	UpdateResponseBodyNone    = 0 // 不修改 body
	UpdateResponseBodyLua     = 1 // 使用 lua 修改 body
	UpdateResponseBodyAppend  = 2 // 追加、注入 body
	UpdateResponseBodyReplace = 3 // 替换 body
)

type item struct {
	CheckUrlType                int
	Url                         string
	UpdateBodyType              int
	AppendOrReplaceBodyFromFile bool
	AppendOrReplaceBody         string
	ShowBody                    bool
}

type Config struct {
	Port  string // 9090
	Nagle bool   // true
	Proxy string // 0
	Items []item
}

func readAll(filename string) string {
	f, err := ioutil.ReadFile(filename)
	if err != nil {
		fmt.Println("read fail", err)
	}
	return string(f)
}
func InitConfig(configPath string) Config {
	var c Config
	err := json.Unmarshal([]byte(readAll(configPath)), &c)
	if err != nil {
		panic(err)
	}
	return c
}
func showUri(str string) {
	fmt.Println("[uri] = " + str)
}
func (config Config) GetItem(uri string) (int, bool) {
	for ind, c := range config.Items {
		switch c.CheckUrlType {
		case CheckUrlTypeLua:
			break
		case CheckUrlTypeContain:
			if strings.Contains(uri, c.Url) {
				showUri(uri)
				return ind, true
			}
			break
		case CheckUrlTypeStartsWith:
			if len(c.Url) <= len(uri) {
				if uri[:len(c.Url)] == c.Url {
					showUri(uri)
					return ind, true
				}
			}
			break
		case CheckUrlTypeEndsWith:
			if len(c.Url) <= len(uri) {
				if uri[len(uri)-len(c.Url):] == c.Url {
					showUri(uri)
					return ind, true
				}
			}
			break
		case CheckUrlTypeMatch:
			if c.Url == uri {
				showUri(uri)
				return ind, true
			}
			break
		}
	}
	return -1, false
}
func (it item) getBody() string {
	if it.AppendOrReplaceBodyFromFile {
		return readAll(it.AppendOrReplaceBody)
	} else {
		return it.AppendOrReplaceBody
	}
}
func (config Config) UpdateBody(source []byte, itemIndex int) []byte {
	if config.Items[itemIndex].ShowBody {
		fmt.Println(string(source))
	}
	switch config.Items[itemIndex].UpdateBodyType {
	case UpdateResponseBodyNone:
		return source
	case UpdateResponseBodyAppend:
		return append(source, []byte(config.Items[itemIndex].getBody())...)
	case UpdateResponseBodyReplace:
		return []byte(config.Items[itemIndex].getBody())
	}
	return source
}

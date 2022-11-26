创建任意结构的 对象，本质为 ```map[string]interface{}```

```go
// https://stackoverflow.com/questions/31467326/golang-modify-json-without-struct
// 使用该代码时注意这里的 包名 应该是什么
package Utils

import (
	"encoding/json"
	"strings"
)

func SetValueInJSON(iface interface{}, path string, value interface{}) interface{} {
	m := iface.(map[string]interface{})
	split := strings.Split(path, ".")
	for k, v := range m {
		if strings.EqualFold(k, split[0]) {
			if len(split) == 1 {
				m[k] = value
				return m
			}
			switch v.(type) {
			case map[string]interface{}:
				return SetValueInJSON(v, strings.Join(split[1:], "."), value)
			default:
				return m
			}
		}
	}
	// path not found -> create
	if len(split) == 1 {
		m[split[0]] = value
	} else {
		newMap := make(map[string]interface{})
		newMap[split[len(split)-1]] = value
		for i := len(split) - 2; i > 0; i-- {
			mTmp := make(map[string]interface{})
			mTmp[split[i]] = newMap
			newMap = mTmp
		}
		m[split[0]] = newMap
	}
	return m
}

func CreateEmptyJSONObject() (a interface{}) {
	//var a interface{}
	json.Unmarshal([]byte("{}"), &a)
	return
}
// 用法
// a = Utils.CreateEmptyJSONObject()
// Utils.SetValueInJSON(a,"name","ibas")
// Utils.SetValueInJSON(a,"pro.age",12)
// Utils.SetValueInJSON(a,"pro.edu","graduate")
```

也可以将上面封装为对象使用

```go
package JsonOp

import (
	"encoding/json"
	"strings"
)

type DynamicJsonOp struct {
	a interface{}
}

func (a * DynamicJsonOp)GetObj() interface{} {
	return a.a
}

func (a * DynamicJsonOp)SetValueInJSON(path string, value interface{})  {
	setValueInJSON(a.a,path,value)
}

func setValueInJSON(iface interface{}, path string, value interface{}) interface{} {
	m := iface.(map[string]interface{})
	split := strings.Split(path, ".")
	for k, v := range m {
		if strings.EqualFold(k, split[0]) {
			if len(split) == 1 {
				m[k] = value
				return m
			}
			switch v.(type) {
			case map[string]interface{}:
				return setValueInJSON(v, strings.Join(split[1:], "."), value)
			default:
				return m
			}
		}
	}
	// path not found -> create
	if len(split) == 1 {
		m[split[0]] = value
	} else {
		newMap := make(map[string]interface{})
		newMap[split[len(split)-1]] = value
		for i := len(split) - 2; i > 0; i-- {
			mTmp := make(map[string]interface{})
			mTmp[split[i]] = newMap
			newMap = mTmp
		}
		m[split[0]] = newMap
	}
	return m
}

func (a * DynamicJsonOp)Init() {
	//var a interface{}
	json.Unmarshal([]byte("{}"), &a.a)
}
// 用法
// 	obj := JsonOp.DynamicJsonOp{}
//	obj.Init()
//	obj.SetValueInJSON("name","ibas")
//	obj.SetValueInJSON("pro.age",12)
//	obj.SetValueInJSON("pro.edu","graduate")
//	bytes,err := json.Marshal(obj.GetObj())
//	if err != nil {
//		panic(err)
//	}
//	fmt.Println(string(bytes))
```
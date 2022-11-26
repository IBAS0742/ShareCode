package server

type Api struct {
	Name   string   `json:"name"`
	Return []string `json:"return"`
	Param  []string `json:"param"`
	Sql    string   `json:"sql"`
	Desc   string   `json:"desc"`
}

func deafultApi() []Api {
	return []Api{
		{
			Name: "getTables",
			Return: []string{"name"},
			Param: []string{},
			Sql: "select name from sqlite_master where type=\"table\" order by name;",
			Desc: "获取所有表名",
		},
	}
}

func AddDefaultWebApi(apis []Api) []Api {
	da := deafultApi()
	mp := map[string] int {}
	for ind,api := range da {
		mp[api.Name] = ind
	}
	for _,api := range apis {
		if _,ok := mp[api.Name];ok {
			mp[api.Name] = -1
		}
	}
	for _,v := range mp {
		if v != -1 {
			apis = append(apis,da[v])
		}
	}
	return apis
}
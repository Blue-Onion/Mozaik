package utils

import "github.com/Blue-Onion/RestApi-Go/config"

var conf *config.Config = config.GetConfig()
var Db string = conf.DbUrl

fs = require 'fs'
path = require 'path'
mysql = require 'mysql'
thej = require 'thenjs'
_ = require 'underscore'
template = require('art-template');
tpath = __dirname + '/formtemplate'
#console.log tpath
client = mysql.createConnection
  user: 'root'
  password: 'awei'
client.connect()
tableinfo = []
dict = ''
filter = ''
query = (sql, cfn)->
  client.query sql, (err, result, filts)->
    if err
      console.log err
    cfn err, result, filts
client.query 'use sr'
get_table_sql = "SELECT TABLE_NAME FROM information_schema.`TABLES` where TABLE_SCHEMA='sr';"
get_cloums_sql = (tname)-> "SELECT COLUMN_NAME,IS_NULLABLE as isnull FROM information_schema.`COLUMNS` where TABLE_NAME='#{tname}' and TABLE_SCHEMA='sr';"
thej (defer)->
  query get_table_sql, (err, result, files)->
    ((n)->
      a = {}
      a.name = n
      tableinfo.push a) t.TABLE_NAME for t in result
    defer()
.then (defer)->
  fs.readFile __dirname + '/dict.json', 'utf-8', (err, data)->
    dict = JSON.parse(data)
    console.log dict
    defer()
.then (defer)->
  fs.readFile __dirname + '/filter.json', 'utf-8', (err, data)->
    filter = JSON.parse(data)
    console.log filter
    defer()
.then (defer)->
  thej.each tableinfo, (ar, bb, index, arry)->
    query(get_cloums_sql(bb.name), (err, result, filtes)->
      ta = []
      result = _.filter result, (r)->
        if _.contains(filter.common, r.COLUMN_NAME)
          return false
        else if (->
          _.find filter.reg,(ele,index,list)->
            regexp=new RegExp(ele)
            if regexp.test r.COLUMN_NAME
              return true
        )()
          return false
        else if _.contains(filter, bb.name) and _.contains(filter[bb.name], r.COLUMN_NAME)
          return false
        else
          return true
      console.log result
      ((r)->
        unless _.has(dict,r.COLUMN_NAME)
          dict[r.COLUMN_NAME]=""
        ta.push(
          {
            "cname": r.COLUMN_NAME,
            "remark": dict[r.COLUMN_NAME],
            "isnull":  if r.isnull=='YES' then null else "required"
          })
#        console.log r
      ) r for r in result
      tableinfo[index].colums = ta
      ar()
    )
  .then ()->
    fs.writeFile __dirname + '/dict.json',JSON.stringify(dict)
    console.log JSON.stringify(tableinfo)
    defer()
.then (defer)->
  client.end()
  fs.writeFile __dirname + '/tableinfo.json', JSON.stringify tableinfo
  _.each tableinfo, (ele, i, list)->
    html1 = template __dirname + '/formaddtemplate', ele
#    console.log html1
    fs.writeFile __dirname + '/outform/add/' + ele.name + '.html', html1
    html2=template __dirname + '/forminlineaddtemplate',ele
    fs.writeFile __dirname + '/outform/add/forminline/' + ele.name + '.html',html2
    html3= template __dirname + '/formupdatetemplate',ele
    fs.writeFile __dirname + '/outform/update/' + ele.name + '.html',html3
    html4 =template __dirname + '/forminlineupdatetemplate',ele
    fs.writeFile __dirname + '/outform/update/forminline/' + ele.name + '.html',html4


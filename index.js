// Generated by CoffeeScript 1.9.3
(function() {
  var _, client, dict, filter, fs, get_cloums_sql, get_table_sql, mysql, path, query, tableinfo, template, thej, tpath;

  fs = require('fs');

  path = require('path');

  mysql = require('mysql');

  thej = require('thenjs');

  _ = require('underscore');

  template = require('art-template');

  tpath = __dirname + '/formtemplate';

  client = mysql.createConnection({
    user: 'root',
    password: 'awei'
  });

  client.connect();

  tableinfo = [];

  dict = '';

  filter = '';

  query = function(sql, cfn) {
    return client.query(sql, function(err, result, filts) {
      if (err) {
        console.log(err);
      }
      return cfn(err, result, filts);
    });
  };

  client.query('use sr');

  get_table_sql = "SELECT TABLE_NAME FROM information_schema.`TABLES` where TABLE_SCHEMA='sr';";

  get_cloums_sql = function(tname) {
    return "SELECT COLUMN_NAME,IS_NULLABLE as isnull FROM information_schema.`COLUMNS` where TABLE_NAME='" + tname + "' and TABLE_SCHEMA='sr';";
  };

  thej(function(defer) {
    return query(get_table_sql, function(err, result, files) {
      var fn, j, len, t;
      fn = function(n) {
        var a;
        a = {};
        a.name = n;
        return tableinfo.push(a);
      };
      for (j = 0, len = result.length; j < len; j++) {
        t = result[j];
        fn(t.TABLE_NAME);
      }
      return defer();
    });
  }).then(function(defer) {
    return fs.readFile(__dirname + '/dict.json', 'utf-8', function(err, data) {
      dict = JSON.parse(data);
      console.log(dict);
      return defer();
    });
  }).then(function(defer) {
    return fs.readFile(__dirname + '/filter.json', 'utf-8', function(err, data) {
      filter = JSON.parse(data);
      console.log(filter);
      return defer();
    });
  }).then(function(defer) {
    return thej.each(tableinfo, function(ar, bb, index, arry) {
      return query(get_cloums_sql(bb.name), function(err, result, filtes) {
        var fn, j, len, r, ta;
        ta = [];
        result = _.filter(result, function(r) {
          if (_.contains(filter.common, r.COLUMN_NAME)) {
            return false;
          } else if ((function() {
            return _.find(filter.reg, function(ele, index, list) {
              var regexp;
              regexp = new RegExp(ele);
              if (regexp.test(r.COLUMN_NAME)) {
                return true;
              }
            });
          })()) {
            return false;
          } else if (_.contains(filter, bb.name) && _.contains(filter[bb.name], r.COLUMN_NAME)) {
            return false;
          } else {
            return true;
          }
        });
        console.log(result);
        fn = function(r) {
          if (!_.has(dict, r.COLUMN_NAME)) {
            dict[r.COLUMN_NAME] = "";
          }
          return ta.push({
            "cname": r.COLUMN_NAME,
            "remark": dict[r.COLUMN_NAME],
            "isnull": r.isnull === 'YES' ? null : "required"
          });
        };
        for (j = 0, len = result.length; j < len; j++) {
          r = result[j];
          fn(r);
        }
        tableinfo[index].colums = ta;
        return ar();
      });
    }).then(function() {
      fs.writeFile(__dirname + '/dict.json', JSON.stringify(dict));
      console.log(JSON.stringify(tableinfo));
      return defer();
    });
  }).then(function(defer) {
    client.end();
    fs.writeFile(__dirname + '/tableinfo.json', JSON.stringify(tableinfo));
    return _.each(tableinfo, function(ele, i, list) {
      var html1, html2, html3, html4;
      html1 = template(__dirname + '/formaddtemplate', ele);
      fs.writeFile(__dirname + '/outform/add/' + ele.name + '.html', html1);
      html2 = template(__dirname + '/forminlineaddtemplate', ele);
      fs.writeFile(__dirname + '/outform/add/forminline/' + ele.name + '.html', html2);
      html3 = template(__dirname + '/formupdatetemplate', ele);
      fs.writeFile(__dirname + '/outform/update/' + ele.name + '.html', html3);
      html4 = template(__dirname + '/forminlineupdatetemplate', ele);
      return fs.writeFile(__dirname + '/outform/update/forminline/' + ele.name + '.html', html4);
    });
  });

}).call(this);

//# sourceMappingURL=index.js.map

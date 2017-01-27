var app         =    require('express')();
var http        =    require('http').Server(app);
var express   =     require('express');
var mysql     =     require("mysql");
var io        =     require("socket.io")(http);
var path      =     require('path');
var bodyParser = require("body-parser");
var crypto = require('crypto'),
    format = require('biguint-format');
var permisos = [];


/* Creating POOL MySQL connection.*/

var connection    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   '',
      database          :   'desarrollodb',
      debug             :   false
});

app.use('/scripts', express.static(__dirname + '/node_modules/chart.js/dist/'));
app.use('/script', express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));
app.set('json spaces', 40);

the_interval = 1000;
  // do your stuff here


app.get("/",function(req,res){
    res.sendFile(__dirname + '/iniciarSesion.html');
});

app.get("/registro",function(req,res){
    res.sendFile(__dirname + '/registro.html');
});

app.get("/carrosingresados",function(req,res){
    res.sendFile(__dirname + '/carrosingresados.html');
});
app.get("/index",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

function randomC (qty) {
    var x= crypto.randomBytes(qty);
    return format(x, 'dec');
}
function random (low, high) {
    return randomC(4)/Math.pow(2,4*8-1) * (high - low) + low;
}



app.post("/logearse",function(req,res){
      console.log("username: " + req.body.UserName );
      console.log("password: " + req.body.Passwod );

        var t="SELECT ci,password FROM persona WHERE ci="+"'"+req.body.UserName+"'"+" and password="+"'"+req.body.Passwod+"'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            io.socket.emit('errorGuardar',"Hubo un error al guardar");
            }
          else {
            io.socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
              }
        });
});

app.post("/logearsephone",function(req,res){
      console.log("username: " + req.body.UserName );
      console.log("password: " + req.body.Passwod );

        var t="SELECT ci,password FROM persona WHERE ci= '" + req.body.UserName + "'" + " and password= '" + req.body.Passwod + "'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows.length > 0) {
            console.log("found");
            var num = Math.round(random(0,65000))
            permisos.push(num);
            res.status(200).send((num).toString())
          } else {
            console.log("notfound");
            res.status(200).send((1).toString())
          }
          }
        });
});

app.post("/getpuesto",function(req,res){

        var t="SELECT id_puesto, estado FROM puesto";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows.length > 0) {
            console.log("found");
            res.status(200).send(stringify(rows))
          } else {
            console.log("notfound");
            res.status(200).send((1).toString())
          }
          }
        });
});

app.post("/setpuesto",function(req,res){
      console.log("puesto: " + req.body.puesto );

        var t="SELECT id_puesto, estado FROM puesto WHERE id_puesto = '" + req.body.puesto + "'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows.length > 0) {
              if (rows[0].estado == 0){
              var t="UPDATE puesto SET estado = 1 WHERE id_puesto = '" + req.body.puesto + "'";
              connection.query(t, function(err, rows, fields) {
                if (err) {
                  res.status(400).send((-1).toString())
                } else {
                  res.status(200).send((0).toString())
                }
            })
          } else {
            res.status(200).send((1).toString())
          }
          }
        }});
});

app.post("/setsalida",function(req,res){
      console.log("puesto: " + req.body.puesto );

        var t="SELECT id_puesto, estado FROM puesto WHERE id_puesto = '" + req.body.puesto + "'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows[0].estado == 1) {
              var t="UPDATE puesto SET estado = 0 WHERE id_puesto = '" + req.body.puesto + "'";
              res.status(200).send((0).toString())
          } else {
            res.status(200).send((1).toString())
          }
          }
        });
});

app.get("/carrosTiempo",function(req,res){
    res.sendFile(__dirname + '/carrrosTiempo.html');

});


  var r = "SELECT * FROM carrosenuni";
  var q = "SELECT count(id_puesto) AS id FROM puesto WHERE estado = 0";
  var s = "SELECT count(id_puesto) AS id FROM puesto WHERE estado = 1";
  var p=  "SELECT MIN(h.fecha_ini) as minimo, MAX(h.fecha_ini) as maximo FROM	historial h";

//  var t = "SELECT prom()"


  var qw = 998;
  var sw = 998;

  //var s = JSON.parse(data);

io.sockets.on('connection', function(socket) {
////////////////////////////////////////REGISTRO DEL USUARIO////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          socket.on('datos',function(data){
                  //  console.log(data);
                var v="INSERT INTO persona(ci,nombre,apellido,direccion,correo,password) VALUES("+"'"+data.cedula+"',"+"'"+data.nombre+"',"+"'"+data.apellido+"',"+"'"+data.dirrecion+"',"+"'"+data.correo+"',"+"'"+data.password+"'"+");";
            //    console.log(v);

                connection.query(v, function(err, rows, fields) {
                if (err) {
                    throw err;
              //  socket.emit('errorGuardar',"Hubo un error al guardar");
                    }
                else {
                 socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
                      }
                  });

                  if(data.funcion=="Estudiante"){
                    var i="INSERT INTO estudiante(ci_est,carrera) VALUES("+"'"+data.cedula+"',"+"'"+data.carrera+"'"+");";
                    console.log(i);
                    connection.query(i, function(err, rows, fields) {
                    if (err) {
                        throw err;
                  //  socket.emit('errorGuardar',"Hubo un error al guardar");
                        }
                    else {
                    //    socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
                          }
                      });


                  }
                  var e="INSERT INTO usuario(ci_usuario,tipo_usuario) VALUES("+"'"+data.cedula+"',"+"'"+data.funcion+"'"+");";
                  connection.query(e, function(err, rows, fields) {
                  if (err) {
                      throw err;
                //  socket.emit('errorGuardar',"Hubo un error al guardar");
                      }
                  else {
                  //    socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
                        }
                    });

            });
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on('fechas',function(data){
    //console.log(data.nombre);
    var w="SELECT DISTINCT p.ci, p.nombre, p.apellido, u.tipo_usuario, c.placa, c.tipo FROM	persona p, usuario u,carro c, historial h WHERE h.fecha_ini BETWEEN "+"'"+data.fechamin+" "+data.horamin+"'" +" AND '"+data.fechamax+" "+data.horamax+"'AND p.ci = h.ci_usuario AND h.placa = c.placa AND u.ci_usuario = h.ci_usuario;";
    console.log(w);

  connection.query(w, function(err, rows, fields) {
      if (err) throw err;
      else
          if(rows[0]){
            console.log(rows);
          socket.emit('carrosFecha',rows);
          }
          else {
        //socket.emit('errorLogin',"error en las credenciales");
        console.log("nada");
          }
    });

  });


  socket.on('logear',function(data){
    console.log(data.nombre);

    var t="SELECT ci,password FROM persona WHERE ci="+"'"+data.nombre+"'"+" and password="+"'"+data.clave+"'";

  connection.query(t, function(err, rows, fields) {
      if (err) throw err;
      else
          if(rows[0]){
            console.log(rows);
          socket.emit('loginCorreto',"si");
          }
          else {
        socket.emit('errorLogin',"error en las credenciales");
          }
    });

  });

  setInterval(function() {

  connection.query(q, function(err, rows, fields) {
      if (err) throw err;
      else  socket.emit('new_a',rows[0].id);
    });

  connection.query(s, function(err, rows, fields) {
      if (err) throw err;
      else  socket.emit('new_b',rows[0].id);
    });

  connection.query(r, function(err, rows, fields) {
    if (err) throw err;
    else {
    socket.emit('new_c', rows);
  //   console.log(rows.length);
    };
        //qw = rows[0].id
    });

    connection.query(p, function(err, rows, fields) {
      if (err) throw err;
      else {
      //  console.log(rows);
      socket.emit('carrosTiempo', rows);
    //   console.log(rows.length);
      };
          //qw = rows[0].id
      });




  }, the_interval);
});


http.listen(3000,function(){
    console.log("Listening on 3000");
});

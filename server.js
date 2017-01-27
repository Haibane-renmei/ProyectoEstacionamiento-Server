var app         =    require('express')();
var http        =    require('http').Server(app);
var express   =     require('express');
var mysql     =     require("mysql");
var io        =     require("socket.io")(http);
var path      =     require('path');
var bodyParser = require("body-parser");


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

the_interval = 1000;
  // do your stuff here


app.get("/",function(req,res){
    res.sendFile(__dirname + '/iniciarSesion.html');
});

app.get("/registro",function(req,res){
    res.sendFile(__dirname + '/registro.html');
});

app.get("/index",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.get("/horas_picos",function(req,res){
    res.sendFile(__dirname + '/horas_picos.html');
});

app.get("/carrosTiempo",function(req,res){
    res.sendFile(__dirname + '/carrosTiempo.html');
});

app.get("/iniciarSesion",function(req,res){
    res.sendFile(__dirname + '/iniciarSesion.html');
});

app.get("/placa",function(req,res){
    res.sendFile(__dirname + '/historialPlaca.html');
});
app.get("/placainfo",function(req,res){
    res.sendFile(__dirname + '/placainfo.html');
});



app.post("/logearse",function(req,res){
      console.log("username: " + req.body.UserName );
      console.log("password: " + req.body.Passwod );

        var t="SELECT ci,password FROM persona WHERE ci="+"'"+req.body.UserName+"'"+" and password="+"'"+req.body.Passwod+"'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            socket.emit('errorGuardar',"Hubo un error al guardar");
            }
          else {
            socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
              }
        });
});

app.get("/carrosTiempo",function(req,res){
    res.sendFile(__dirname + '/carrrosTiempo.html');

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
            var num = 1;
            res.status(200).send((num).toString())
          } else {
            console.log("notfound");
            res.status(200).send((0).toString())
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
      console.log("username: " + req.body.UserName );
      console.log("password: " + req.body.Passwod );

        var t="SELECT id_puesto, estado FROM puesto WHERE id_puesto = '" + req.body.puesto + "'";
        var t3="UPDATE puesto SET estado = 1 WHERE id_puesto = '" + req.body.puesto + "'";


      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows.length > 0) {
              if (rows[0].estado == 0){

              connection.query(t3, function(err, rows, fields) {
                if (err) {
                  res.status(400).send((-1).toString())
                } else {
                  res.status(200).send((0).toString())
                  connection.query(t3, function(err, rows, fields) {;})
            }})
          } else {
            res.status(200).send((1).toString())
          }
          }
        }});
});

app.post("/setsalida",function(req,res){
      console.log("puesto: " + req.body.puesto );

        var t="SELECT id_puesto, estado FROM puesto WHERE id_puesto = '" + req.body.puesto + "'";
        var t3="UPDATE puesto SET estado = 0 WHERE id_puesto = '" + req.body.puesto + "'";

      connection.query(t, function(err, rows, fields) {
          if (err) {
              throw err;
            console.log("error");
            res.status(400).send((-1).toString())
            }
          else {
            if (rows[0].estado == 1) {
              var t="UPDATE puesto SET estado = 0 WHERE id_puesto = '" + req.body.puesto + "'";
              connection.query(t, function(err, rows, fields) {})
              res.status(200).send((0).toString())
          } else {
            res.status(200).send((1).toString())
          }
          }
        });
});

  var r = "SELECT * FROM carrosenuni cnu WHERE cnu.fecha_fin ='9999-12-31 00:00:00'";
  var q = "SELECT count(id_puesto) AS id FROM puesto WHERE estado = 0";
  var s = "SELECT count(id_puesto) AS id FROM puesto WHERE estado = 1";
  var p=  "SELECT MIN(h.fecha_ini) as minimo, MAX(h.fecha_ini) as maximo FROM	historial h";
  var f= "SELECT COUNT(DISTINCT cnu.placa) as cant FROM carrosenuni cnu WHERE cnu.fecha_fin ='9999-12-31 00:00:00'";

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
                    //socket.emit('GuardoCorrecto',"Fueron guardados con exito los datos enviados");
                        }
                    });

            });
  ///////////////////////////////////////////////////carrosTiempo////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on('fechas',function(data){
    //console.log(data.nombre);\
    var aux,aux2;
    var datos;
    if(data.tipo_u=="TODOS"){
              var w="SELECT  p.ci, p.nombre, p.apellido, u.tipo_usuario, c.placa, c.marca, c.modelo, c.color, c.tipo FROM	persona p, usuario u,carro c, historial h WHERE h.fecha_ini BETWEEN "+"'"+data.fechamin+" "+data.horamin+"'" +" AND '"+data.fechamax+" "+data.horamax+"'AND p.ci = h.ci_usuario AND h.placa = c.placa AND u.ci_usuario = h.ci_usuario;";
              var r="SELECT COUNT(h.placa) as cnt FROM historial h WHERE h.fecha_ini BETWEEN TIMESTAMP("+"'"+data.fechamin+"'"+","+"'"+data.horamin+"'"+") AND TIMESTAMP("+"'"+data.fechamax+"'"+","+"'"+data.horamax+"'"+");";
              console.log(r);
}
    else{
        var w="SELECT  p.ci, p.nombre, p.apellido, u.tipo_usuario, c.placa, c.marca, c.modelo, c.color, c.tipo FROM	persona p, usuario u,carro c, historial h WHERE h.fecha_ini BETWEEN "+"'"+data.fechamin+" "+data.horamin+"'" +" AND '"+data.fechamax+" "+data.horamax+"'AND p.ci = h.ci_usuario AND h.placa = c.placa AND u.ci_usuario = h.ci_usuario AND UPPER(u.tipo_usuario) ="+"'"+data.tipo_u+"'"+";";
          var r="SELECT COUNT(h.placa) as cnt FROM historial h,usuario u WHERE h.fecha_ini BETWEEN TIMESTAMP("+"'"+data.fechamin+"'"+","+"'"+data.horamin+"'"+") AND TIMESTAMP("+"'"+data.fechamax+"'"+","+"'"+data.horamax+"'"+") AND UPPER(u.tipo_usuario) ="+"'"+data.tipo_u+"'"+" AND u.ci_usuario=h.ci_usuario;";
          console.log(r);
    }

    console.log(w);

  connection.query(w, function(err, rows, fields) {
      if (err) throw err;
      else
          if(rows[0]){
          //  console.log(rows);
                aux=rows;
            connection.query(r, function(err, rows, fields) {
                if (err) throw err;
                else
                    if(rows[0]){
                    //  console.log(rows);
                      aux2=rows;
                     datos={
                       datosR:aux,
                       cantidad:aux2

                     };
                     console.log(datos);
                   socket.emit('carrosFecha',datos);
                    }
                    else {
                  //socket.emit('errorLogin',"error en las credenciales");
                  console.log("nada");
                    }
              });

          }
          else {
        //socket.emit('errorLogin',"error en las credenciales");
        console.log("nada");
          }
    });


  });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on('logear',function(data){
    console.log(data.nombre);


      var v="SELECT ci_usuario,tipo_usuario FROM usuario WHERE ci_usuario="+"'"+data.nombre+"'";

  connection.query(v, function(err, rows, fields) {
      if (err) throw err;
      else
          if(rows[0]){
            console.log(rows);
            if(rows[0].tipo_usuario==''){
              console.log("tu madre");
              //var aux=rows.ci_usuario;
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

            }
            else{

                socket.emit('errorLogin',"no tiene permiso de login");
            }
          }
          else {
        socket.emit('errorLogin',"error en las credenciales");
          }
    });

  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            socket.on('horas_pico',function(data){

              if (data.tipo_u=="TODOS") {
                var c="SELECT COUNT(h.placa) as cnt FROM historial h, usuario u, persona p, carro c WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa";
                var t="SELECT h.fecha_ini, p.ci, p.nombre, p.apellido,h.placa, c.tipo, c.marca, c.modelo, c.color FROM historial h, usuario u, persona p, carro c  WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa";

              }
              else {
                var c="SELECT COUNT(h.placa) as cnt FROM historial h, usuario u, persona p, carro c WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa AND UPPER(u.tipo_usuario) ="+"'"+data.tipo_u+"'";
                var t="SELECT h.fecha_ini, p.ci, p.nombre, p.apellido,h.placa, c.tipo, c.marca, c.modelo, c.color FROM historial h, usuario u, persona p, carro c  WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa AND UPPER(u.tipo_usuario) ="+"'"+data.tipo_u+"'";

              }
              console.log(data);
              var aux,aux2;
           var datos;

              console.log(t);
           connection.query(t, function(err, rows, fields) {
                if (err) throw err;
                else
                    if(rows[0]){
                      //console.log(rows);
                      aux=rows;

                      connection.query(c, function(err, rows, fields) {
                           if (err) throw err;
                           else
                               if(rows[0]){
                                 //console.log(rows);
                                 aux2=rows;
                                datos={
                                  datosR:aux,
                                  cantidad:aux2

                                };
                                console.log(datos);

                               socket.emit('datos_pico',datos);
                               }
                         });
                    }
              });

            });




  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on('placaB',function(data){


      var c="SELECT h.fecha_ini, h.fecha_fin, h.id_puesto FROM historial h WHERE UPPER(h.placa) = UPPER("+"'"+data.placa+"'"+") AND h.fecha_ini BETWEEN TIMESTAMP("+"'"+data.fechamin+"'"+","+"'"+data.horamin+"'"+") AND TIMESTAMP("+"'"+data.fechamax+"'"+","+"'"+data.horamax+"'"+");";
    //  var t="SELECT h.fecha_ini, p.ci, p.nombre, p.apellido,h.placa, c.tipo, c.marca, c.modelo, c.color FROM historial h, usuario u, persona p, carro c  WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa";

    console.log(data);
    console.log(c);

    //console.log(t);
 connection.query(c, function(err, rows, fields) {
      if (err) throw err;
      else
          if(rows[0]){
            console.log(rows);
            socket.emit('datosplaca',rows);

          }
    });

  });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('infoplaca',function(data){


    var c="SELECT p.ci, p.nombre, p.apellido, u.tipo_usuario, c.tipo, c.marca, c.modelo, c.color FROM persona p, usuario u,carro c WHERE UPPER(c.placa) = UPPER("+"'"+data.placa+"'"+") AND p.ci = c.ci_usuario AND u.ci_usuario = c.ci_usuario";
  //  var t="SELECT h.fecha_ini, p.ci, p.nombre, p.apellido,h.placa, c.tipo, c.marca, c.modelo, c.color FROM historial h, usuario u, persona p, carro c  WHERE DATE(h.fecha_ini) BETWEEN "+"'"+data.fechamin+"' AND"+"'"+data.fechamax+"' AND TIME(h.fecha_ini) BETWEEN '"+data.horaminimo+"' AND "+"'"+data.horamax+"' AND u.ci_usuario = h.ci_usuario AND h.ci_usuario = p.ci AND h.placa = c.placa";

  console.log(data);
  console.log(c);

  //console.log(t);
connection.query(c, function(err, rows, fields) {
    if (err) throw err;
    else
        if(rows[0]){
          console.log(rows);
          socket.emit('datosplaca',rows);

        }
  });

});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

      connection.query(f, function(err, rows, fields) {
        if (err) throw err;
        else {
        //  console.log(rows);
      //  console.log(rows);
        socket.emit('cantidadCarros', rows);
      //   console.log(rows.length);
        };
            //qw = rows[0].id
        });






  }, the_interval);
});


http.listen(3000,function(){
    console.log("Listening on 3000");
});

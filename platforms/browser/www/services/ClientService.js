class ClientService {

    constructor(cb, fnc) {
        let me = this;
        this.ddbb = window.openDatabase(
            cb.code,
            '1.0',
            cb.name,
            5242880);
        this.ddbb.transaction(function(tx) {
            //tx.executeSql('DROP TABLE IF EXISTS clientes');
            //tx.executeSql('DROP TABLE IF EXISTS databases');
            //tx.executeSql('DROP TABLE IF EXISTS localidad');
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS localidad (' + 
                    'id integer NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                    'nomb text NOT NULL' + 
                ')'
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS clientes (' + 
                    'id integer NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                    'nomb text NOT NULL,' +
                    'nomf text NOT NULL UNIQUE,' +  
                    'domc text NOT NULL,' + 
                    'loca integer NOT NULL,' + 
                    'tele text NOT NULL,' +
                    'corr text,' +
                    'cntc text,' + 
                    'expo text,' + 
                    'hori text NOT NULL,' + 
                    'horf text NOT NULL,' + 
                    'fech integer,' + 
                    'FOREIGN KEY(loca) REFERENCES localidad(id),' +
                    'FOREIGN KEY(fech) REFERENCES visitas(id)' +
                ')'
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS visitas (' + 
                    'id integer NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                    'clie integer NOT NULL,' +
                    'desc text,' + 
                    'fech text NOT NULL,' + 
                    'FOREIGN KEY(clie) REFERENCES clientes(id)' +
                ')'
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS catalogos (' + 
                    'id integer NOT NULL PRIMARY KEY AUTOINCREMENT,' + 
                    'nomb text NOT NULL UNIQUE,' + 
                    'desc text' + 
                ')'
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS r_cat_cli (' + 
                    'idcl integer NOT NULL,' + 
                    'idca integer NOT NULL,' + 
                    'fech text,' +
                    'PRIMARY KEY(idcl, idca)' + 
                ')'
            );
        }, function(err) {
            bootbox.alert({
                message: 'ERROR · No se ha podido inicializar la base de datos: ' + cb.name,
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al inicializar la base de datos: ' + cb.code + ' : ' + err.code);
        }, function() {
            console.log('La base de datos "' + cb.code + '" ha sido inicializada correctamente');
            me.countLocalidad(function(count) {
                if(count == 0) me._init_localidades(fnc);
                else fnc();
            });
        });
    }

    
    /* CRUD Clientes */
    getCliente(id, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT ' + 
                    'clientes.id id, ' +
                    'clientes.nomb nomb, ' +
                    'clientes.nomf nomf, ' +
                    'clientes.domc domc, ' +
                    'clientes.loca loca, ' +
                    'localidad.nomb nloc, ' +
                    'clientes.tele tele, ' +
                    'clientes.corr corr, ' +
                    'clientes.fech fech, ' +
                    'time(clientes.hori) hori, ' +
                    'time(clientes.horf) horf, ' +
                    'clientes.expo expo ' +
                'FROM clientes INNER JOIN localidad ON clientes.loca = localidad.id ' +
                'WHERE clientes.id = ' + id,
                [],
                function(tx, r) {
                    if(r && r.rows) {
                        let result = null;
                        if(r.rows.length == 1) {
                            let date = new Date(); 
                            let now = date.getHours() * 60 + date.getMinutes();
                            result = r.rows[0];
                            let ini = Number(result.hori.split(':')[0]) * 60 + Number(result.hori.split(':')[1]);
                            let fin = Number(result.horf.split(':')[0]) * 60 + Number(result.horf.split(':')[1]);
                            if(ini <= now && now <= fin) {
                                result.esta = 'ABIERTO';
                            } else {
                                result.esta = 'CERRADO';
                            }
                        }
                        fnc(result);
                    }
                },
                function(tx, err) {
                    console.log('Error al consultar el cliente en la bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al consultar el cliente',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al consultar el cliente en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    listClientes(fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT ' + 
                    'clientes.id id, ' +
                    'clientes.nomb nomb, ' +
                    'localidad.nomb loca, ' +
                    'clientes.tele tele, ' +
                    'clientes.fech fech, ' +
                    'time(clientes.hori) hori, ' +
                    'time(clientes.horf) horf ' +
                'FROM clientes INNER JOIN localidad ON clientes.loca = localidad.id',
                [],
                function(tx, r) {
                    if(r && r.rows) {
                        let result = [];
                        let date = new Date(); 
                        let now = date.getHours() * 60 + date.getMinutes();
                        $.each(r.rows, function(i, v) {
                            result[i] = v;
                            let ini = Number(v.hori.split(':')[0]) * 60 + Number(v.hori.split(':')[1]);
                            let fin = Number(v.horf.split(':')[0]) * 60 + Number(v.horf.split(':')[1]);
                            if(ini <= now && now <= fin) {
                                result[i].esta = 'ABIERTO';
                            } else {
                                result[i].esta = 'CERRADO';
                            }
                        });
                        fnc(result);
                    }
                },
                function(tx, err) {
                    console.log('Error al consultar la lista de clientes en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al consultar la lista de clientes',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al consultar la lista de clientes en bbdd: ' + err.code + ' · ' + err.message);
        });
    }
    
    listLocalidades(fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT ' + 
                    'id,' +
                    'nomb ' +
                'FROM localidad',
                [],
                function(tx, r) {
                    if(r && r.rows) fnc(r.rows);
                },
                function(tx, err) {
                    console.log('Error al consultar la lista de localidades en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al consultar la lista de localidades',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al consultar la lista de clientes en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    insertarCliente(obj, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'INSERT INTO clientes (' + 
                    'nomb, ' +
                    'nomf, ' +
                    'domc, ' +
                    'loca, ' +
                    'tele, ' +
                    'corr, ' +
                    'hori, ' +
                    'horf, ' +
                    'expo ' +
                ') VALUES (' +
                    '"' + obj.nomb + '", ' +
                    '"' + obj.nomf + '", ' +
                    '"' + obj.domc + '", ' +
                    ' ' + obj.loca + ',  ' +
                    '"' + obj.tele + '", ' +
                    '"' + obj.corr + '", ' +
                    '"' + obj.hori + '", ' +
                    '"' + obj.horf + '", ' +
                    '"' + obj.expo + '" ' +
                ')', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al guardar el cliente en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al guardar el cliente',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al guardar el cliente en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    uploadCliente(obj, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'UPDATE clientes SET ' + 
                    'nomb = "' + obj.nomb + '", ' +
                    'nomf = "' + obj.nomf + '", ' +
                    'domc = "' + obj.domc + '", ' +
                    'loca = "' + obj.loca + '", ' +
                    'tele = "' + obj.tele + '", ' +
                    'corr = "' + obj.corr + '", ' +
                    'hori = "' + obj.hori + '", ' +
                    'horf = "' + obj.horf + '", ' +
                    'expo = "' + obj.expo + '"  ' +
                'WHERE ' +
                    'id = "' + obj.id + '" ', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al modificar el cliente en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al modificar el cliente',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al modificar el cliente en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    deleteCliente(id, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'delete from clientes' + 
                ' where id = "' + id + '"', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al eliminar el cliente en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al borrar el cliente',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al eliminar el cliente en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    countLocalidad(fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT COUNT(*) cnt FROM localidad',
                [],
                function(tx, r) {
                    if(r && r.rows && r.rows.length > 0) fnc(r.rows[0].cnt);
                },
                function(tx, err) {
                    console.log('Error al contar la lista de clientes en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al contar la lista de clientes [Err.DDBB]',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al contar la lista de clientes en bbdd: ' + err.code + ' · ' + err.message);
        });
    }


    /* CRUD Catalogos */
    getCatalogo(id, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT ' + 
                    'catalogos.id id, ' +
                    'catalogos.nomb nomb, ' +
                    'catalogos.desc desc  ' +
                'FROM catalogos ' +
                'WHERE catalogos.id = ' + id,
                [],
                function(tx, r) {
                    if(r && r.rows) {
                        let result = null;
                        if(r.rows.length == 1) result = r.rows[0];
                        fnc(result);
                    }
                },
                function(tx, err) {
                    console.log('Error al consultar el catálogo en la bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al consultar el catálogo',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al consultar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    listCatalogos(fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT ' + 
                    'catalogos.id id, ' +
                    'catalogos.nomb nomb, ' +
                    'catalogos.desc desc ' +
                'FROM catalogos ',
                [],
                function(tx, r) {
                    if(r && r.rows) fnc(r.rows);
                },
                function(tx, err) {
                    console.log('Error al consultar la lista de catálogos en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · Al consultar la lista de catálogos',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al consultar la lista de catálogos en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    insertarCatalogo(obj, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'INSERT INTO catalogos (' + 
                    'nomb, ' +
                    'desc ' +
                ') VALUES (' +
                    '"' + obj.nomb + '", ' +
                    '"' + obj.desc + '"  ' +
                ')', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al guardar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al guardar el catálogo',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al guardar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    uploadCatalogo(obj, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'UPDATE catalogos SET ' + 
                    'nomb = "' + obj.nomb + '", ' +
                    'desc = "' + obj.desc + '"  ' +
                'WHERE ' +
                    'id = "' + obj.id + '" ', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al modificar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al modificar el catálogo',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al modificar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    deleteCatalogo(id, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'DELETE FROM catalogos ' + 
                'WHERE ' +
                '    id = "' + id + '"', 
                [],
                function(tx, r) {
                    fnc();
                },
                function(tx, err) {
                    console.log('Error al eliminar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'Se ha producido un error al borrar el catálogo',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al eliminar el catálogo en bbdd: ' + err.code + ' · ' + err.message);
        });
    }

    /* Private Function */
    _init_localidades(fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql('INSERT INTO localidad (nomb) values ("Alaró")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Alcanada")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Alcudia")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Algaida")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Andrach")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Ariany")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Artá")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Bañalbufar")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Bellavista")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Biniaraix")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Binisalem")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Búger")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Buñola")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Caimari")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cala Blava")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cala Millor")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cala d´Or")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cala Rajada")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cala Tuent")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Camp de Mar")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Campanet")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Campos")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Can Pastilla")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Can Picafort")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Capdepera")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Cas Capità")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Colonia de San Jorge")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Colonia de San Pedro")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Consell")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Costitx")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Deyá")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("El Arenal")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Escorca")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Esporlas")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Estellenchs")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Fornaluch")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Galilea")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("La Calobra")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("La Puebla")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Las Salinas")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Llombards")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Lloret de Vista Alegre")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Lloseta")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Llubí")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Manacor")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Mancor del Valle")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("María de la Salud")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Marrachí")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Montuiri")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Muro")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Orient (España)")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Palma de Mallorca")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Palmañola")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Petra")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Pina")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Pla de Na Tesa")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Porreras")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Porto Cristo")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Pòrtol")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Portopetro")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Puente de Inca")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Puerto de Alcudia")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Puerto de Andrach")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Puerto de Sóller")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Puigpuñent")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("S´Arracó")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("S´Illot")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Sa Cabaneta")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Sa Coma")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Sa Ràpita")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("San Juan")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("San Lorenzo de Cardessar")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("San Telmo")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Sancellas")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Santa Eugenia")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Santa Margarita")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Santa María del Camino")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Santañy")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Selva")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Sinéu")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Son Carrió")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Son Servera")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Ullaró")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Valldemosa")');
            tx.executeSql('INSERT INTO localidad (nomb) values ("Villafranca de Bonany")');
        }, function(err) {
            bootbox.alert({
                message: 'ERROR · No se ha podido inicializar la tabla de localidades',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al inicializar la tabla de localidades: ' + err.code + '·' + err.message);
        }, function() {
            console.log('La tabla de localidades se ha inicializado correctamente');
            fnc();
        });
    }

}
class ConfigService {

    constructor(fnc) {
        this.ddbb = window.openDatabase(
            'climng.config',
            '1.0',
            'configuration',
            10240);
        this.ddbb.transaction(function(tx) {
            //tx.executeSql('DROP TABLE IF EXISTS config');
            //tx.executeSql('DROP TABLE IF EXISTS databases');
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS config (' + 
                    'key text NOT NULL PRIMARY KEY,' + 
                    'value text NOT NULL' + 
                ')'
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS databases (' + 
                    'code text NOT NULL PRIMARY KEY,' +
                    'name text NOT NULL' +
                ')'
            );
        }, function(err) {
            bootbox.alert({
                message: 'ERROR · No se ha podido inicializar la aplicación por lo que no se podrá usar',
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al crear la base de datos maestra: ' + err.code + ' · ' + err.message);
        }, function() {
            console.log('La base de datos maestra ha sido inicializada correctamente');
            fnc();
        });
    }

    getProperty(key, fnc) {
        this.ddbb.transaction(function(tx) {
            tx.executeSql(
                'SELECT * FROM config',
                [],
                function(tx, r) {
                    let value = null;
                    if(r && r.rows && r.rows.length && r.rows[0].value) {
                        value = r.rows[0].value;
                    }
                    fnc(value);
                }, function(err) {
                    console.log('Error al cargar la propiedad: ' + key + ' : ' + err.code + ' · ' + err.message);
                })
        }, function() {
            bootbox.alert({
                message: 'ERROR · No se ha podido cargar la propiedad: ' + key,
                buttons: {
                    ok: {
                        label: 'Aceptar',
                        className: 'btn-success'
                    }
                },
                backdrop: true
            });
            console.log('Error al cargar la propiedad: ' + key + ' : ' + err.code + ' · ' + err.message);
        });
    }

    getCustomerBase(fnc) {
        let me = this;
        me.getProperty('customerbase', function(value) {
            me.ddbb.transaction(function(tx) {
                tx.executeSql(
                    'SELECT * FROM databases',
                    [],
                    function(tx, r) {
                        let value = null;
                        if(r && r.rows && r.rows.length) value = r.rows[0];
                        fnc(value);
                    }, function(err) {
                        console.log('Error al cargar la cartera de clientes principal: ' + err.code + ' · ' + err.message);
                    })
            }, function() {
                bootbox.alert({
                    message: 'ERROR · Al cargar la cartera de clientes principal',
                    buttons: {
                        ok: {
                            label: 'Aceptar',
                            className: 'btn-success'
                        }
                    },
                    backdrop: true
                });
                console.log('Error al cargar la cartera de clientes principal: ' + err.code + ' · ' + err.message);
            });
        });
    }

}
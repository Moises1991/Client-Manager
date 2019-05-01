//* Javascript principal *//

// Funciones de inicialización
$(function() {
    let form = $('form[name=frmCliente]');
    let frmCatalogo = $('form[name=frmCatalogo]');

    Window.ConfigService = new ConfigService(function() {
        Window.ConfigService.getCustomerBase(function(cbase) {
            let cb = cbase || {code: 'test', name: 'Test'};
            $('.navbar-brand h2').html(cb.name);
            Window.ClientService = new ClientService(cb, function() {
                fillClientTable();
                fillCatalogosTable();
                fillLocalidadesSelect();
            });
        });
    });

    initFormulario(form, {
            nomb: 'required',
            nomf: 'required',
            domc: 'required',
            loca: 'required',
            tele: {
                required: true,
                minlength: 2
            },
            corr: 'email',
            hori: 'required',
            horf: 'required',
        },
        function(params) {
            if(params.id) {
                Window.ClientService.uploadCliente(params, function() {
                    $('#modalCliente').modal('hide');
                    fillClientTable();
                });
            } else {
                Window.ClientService.insertarCliente(params, function() {
                    $('#modalCliente').modal('hide');
                    fillClientTable();
                });
            }
        }
    );
    initFormulario(frmCatalogo, {
            nomb: 'required'
        },
        function(params) {
            if(params.id) {
                Window.ClientService.uploadCatalogo(params, function() {
                    $('#modalCatalogo').modal('hide');
                    fillCatalogosTable();
                });
            } else {
                Window.ClientService.insertarCatalogo(params, function() {
                    $('#modalCatalogo').modal('hide');
                    fillCatalogosTable();
                });
            }
        }
    );


    $('.btn-guardar-cliente').click(function() {
        let form = $('form[name=frmCliente]');
        form.submit();
    });
    $('.btn-guardar-catalogo').click(function() {
        let form = $('form[name=frmCatalogo]');
        form.submit();
    });

    $('select').change(function() {
        let parent = $(this).closest('.form-group');
        if(parent.hasClass('valid') || parent.hasClass('error')) {
            if($(this).val()) {
                parent.removeClass('error').addClass('valid');
            } else {
                parent.removeClass('valid').addClass('error');
            }
        }
    });

    $('input[type=tel]').keyup(function(e) {
        if(!/^[6-9]{1}[0-9]*$/gm.test($(this).val())) {
            $(this).val($(this).val().substring(0, $(this).val().length - 1));
        }
    });
    $('input[type=tel]').on('paste', function(e) {
        let val = e.originalEvent.clipboardData.getData('text');
        if(val.length == 9 && !/^[6-9]{1}[0-9]*$/gm.test(val)) {
            e.preventDefault();
        }
    });

    $('input[name=hori]').change(function() {
        $('input[name=horf]').attr('min', $(this).val());
        $('input[name=horf]').focus();
        $('input[name=hori]').focus();
    });
    $('input[name=horf]').change(function() {
        $('input[name=hori]').attr('max', $(this).val());
        $('input[name=hori]').focus();
        $('input[name=horf]').focus();
    });

    $('.btn-add').click(function() {
        if($('[href="#clientes"]').hasClass('active')) {
            cleanClientForm();
            $('#modalCliente').modal('show');
        } else if($('[href="#catalogos"]').hasClass('active')) {
            cleanCatalogoForm();
            $('#modalCatalogo').modal('show');
        }
    });

});

function fillClientTable() {
    
    Window.ClientService.listClientes(function(rows) {
        $('.tblClients').DataTable({
            info: false,
            searching: false,
            paging: false,
            autoWidth: false,
            fixedHeader: true,
            data: rows,
            columnDefs: [
                { className: 'col-acciones', targets: [4] }
            ],
            columns: [
                { data: 'nomb', title: 'Nombre'},
                { data: 'loca', title: 'Localidad' },
                { data: 'tele', title: 'Teléfono' },
                { data: 'esta', title: 'Estado' },
                //{ data: 'fech', title: 'Visitado' }
                { data: function(row) {
                    let btnModf = '<button class="btn btn-link btn-tabla color-green" onclick="modfCliente(' + row.id + ')"><i class="fas fa-edit"></i></button>';
                    let btnVisi = '<button class="btn btn-link btn-tabla color-sky ml-1" onclick="addVisitaCliente(' + row.id + ')"><i class="fas fa-calendar-alt"></i></button>';
                    let btnCata = '<button class="btn btn-link btn-tabla color-violet ml-1" onclick="addCatalogoCliente(' + row.id + ')"><i class="fas fa-book"></i></button>';
                    let btnDelt = '<button class="btn btn-link btn-tabla color-orange ml-1" onclick="deltCliente(' + row.id + ')"><i class="fas fa-trash-alt"></i></button>';
                    return btnModf + btnVisi + btnCata + btnDelt;
                }, title: 'Acciones' }
            ],
            drawCallback: function(settings) {
                $('.tblClients thead th').removeClass('col-acciones');
            },
            destroy: true
        });
    });

}

function fillCatalogosTable() {
    
    Window.ClientService.listCatalogos(function(rows) {
        $('.tblCatalogos').DataTable({
            info: false,
            searching: false,
            paging: false,
            autoWidth: false,
            fixedHeader: true,
            data: rows,
            columnDefs: [
                { className: 'col-acciones', targets: [2] }
            ],
            columns: [
                { data: 'nomb', title: 'Nombre'},
                { data: 'desc', title: 'Descripción' },
                //{ data: 'fech', title: 'Visitado' }
                { data: function(row) {
                    let btnModf = '<button class="btn btn-link btn-tabla color-green" onclick="modfCatalogo(' + row.id + ')"><i class="fas fa-edit"></i></button>';
                    let btnClie = '<button class="btn btn-link btn-tabla color-violet ml-1" onclick="addClienteCatalogo(' + row.id + ')"><i class="fas fa-user"></i></button>';
                    let btnDelt = '<button class="btn btn-link btn-tabla color-orange ml-1" onclick="deltCatalogo(' + row.id + ')"><i class="fas fa-trash-alt"></i></button>';
                    return btnModf + btnClie + btnDelt;
                }, title: 'Acciones' }
            ],
            drawCallback: function(settings) {
                $('.tblCatalogos thead th').removeClass('col-acciones');
            },
            destroy: true
        });
    });

}

function fillLocalidadesSelect() {
    Window.ClientService.listLocalidades(function(rows) {
        let select = $('form[name=frmCliente] [name=loca]');
        select.append(new Option());
        $.each(rows, function(i, v) {
            select.append(new Option(v.nomb, v.id));
        });
        select.selectpicker('refresh');
    });
}

function initFormulario(form, rules, fnc) {
    form.validate({
        rules: rules,
        highlight: function (element) {
            $(element).closest('.form-group').removeClass('valid').addClass('error');
        },
        success: function (element) {
            element.closest('.form-group').removeClass('error').addClass('valid');
        },
        submitHandler: function(frm) {
            let params = {};
            form.serializeArray().map(function(x){
                params[x.name] = x.value;
            });
            fnc(params);
        },
        invalidHandler: function(event, validator) {
            $('.alert', form).removeClass('dn');
        },
        errorClass: 'dn'
    });
}

function cleanClientForm() {
    let form = $('form[name=frmCliente]');
    $('input, textarea', form).val('');
    $('select', form).val('').selectpicker('refresh');
    $('.valid, .error', form).removeClass('valid').removeClass('error');
    $('#modalCliente .modal-title').html('Añadir Cliente');
}
function cleanCatalogoForm() {
    let form = $('form[name=frmCatalogo]');
    $('input, textarea', form).val('');
    $('select', form).val('').selectpicker('refresh');
    $('.valid, .error', form).removeClass('valid').removeClass('error');
    $('#modalCatalogo .modal-title').html('Añadir Catálogo');
}

/* CRUD Clientes */
function modfCliente(id) {
    let form = $('form[name=frmCliente]');
    Window.ClientService.getCliente(id, function(cliente) {
        for(let attr in cliente) $('[name=' + attr + ']').val(cliente[attr]);
        $('.selectpicker', form).selectpicker('refresh');
        $('#modalCliente .modal-title').html('Modificar Cliente');
        $('#modalCliente').modal('show');
    });
}
function deltCliente(id) {
    bootbox.confirm({
        message: "Seguro que desea borrar el cliente?",
        buttons: {
            confirm: {
                label: 'Borrar',
                className: 'btn-success'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-light'
            }
        },
        callback: function (result) {
            if(result) {
                Window.ClientService.deleteCliente(id, function() {
                    fillClientTable();
                    bootbox.alert({
                        message: "El cliente se ha borrado satisfactoriamente",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-success'
                            }
                        },
                        backdrop: true
                    });
                });
            }
        }
    });
}

/* CRUD Catalogos */
function modfCatalogo(id) {
    let form = $('form[name=frmCatalogo]');
    Window.ClientService.getCatalogo(id, function(catalogo) {
        for(let attr in catalogo) $('[name=' + attr + ']').val(catalogo[attr]);
        $('#modalCatalogo .modal-title').html('Modificar Catálogo');
        $('#modalCatalogo').modal('show');
    });
}
function deltCatalogo(id) {
    bootbox.confirm({
        message: "Seguro que desea borrar el catálogo?",
        buttons: {
            confirm: {
                label: 'Borrar',
                className: 'btn-success'
            },
            cancel: {
                label: 'Cancelar',
                className: 'btn-light'
            }
        },
        callback: function (result) {
            if(result) {
                Window.ClientService.deleteCatalogo(id, function() {
                    fillCatalogosTable();
                    bootbox.alert({
                        message: "El catálogo se ha borrado satisfactoriamente",
                        buttons: {
                            ok: {
                                label: 'Aceptar',
                                className: 'btn-success'
                            }
                        },
                        backdrop: true
                    });
                });
            }
        }
    });
}
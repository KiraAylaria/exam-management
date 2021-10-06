// Benachrichtungs Element erzeugen
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
        popup: "swal2-popup-custom"
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

let examsTable = null;

let summernoteTopicChange = null;
let summernoteOtherChange = null;

$(document).ready(function() {
    $('div.swal2-popup').addClass('sweetalert-darkmode');
    // Erstellen der Eingabefelder
    $('#textTopic').summernote({
        minHeight: 85
    });
    $('#textOther').summernote();

    summernoteTopicChange = $('#textTopicChange').summernote({
        minHeight: 85
    });
    summernoteOtherChange = $('#textOtherChange').summernote();

    // Erstellen der Tabelle um klausuren anzeigen zu können.
    examsTable = $("#examsTable").DataTable({
        "responsive": true,
        "autowidth": true,
        "lengthMenu": [[5, 10, 25, 50], [5, 10, 25, 50]],
        "ajax": {
            "url": "src/php/_ajax/ajax.listExams.php",
            "dataSrc": "exams"
        },
        "columns": [
            { "data" : "subject" },
            { "data" : "class" },
            { 
                "data" : null,
                render: function (row) {
                    if (row.room.length > 0) {
                        return row.room;
                    } else {
                        return "-";
                    }
                }
            },
            { 
                "data" : null,
                render: function (row) {
                    if (row.lessonFrom != null) {
                        return row.lessonFrom + ". Std.";
                    } else if (row.timeFrom != null) {
                        return row.timeFrom.substring(0, 5) + " <i class='far fa-clock'></i>";
                    } else {
                        return "-";
                    }
                }
            },
            { 
                "data" : null,
                render: function (row) {
                    if (row.lessonTo != null) {
                        return row.lessonTo + ". Std.";
                    } else if (row.timeTo != null) {
                        return row.timeTo.substring(0, 5) + " <i class='far fa-clock'></i>";
                    } else {
                        return "-";
                    }
                } 
            },
            { 
                searchable: false,
                orderable: false,
                "data" : "id",
                render: function (exams) { return '\
                    <div class="btn-group">\
                        <button type="button" class="btn btn-primary" name="editExam" data-id="'+exams+'"><i class="fas fa-pen"></i></button>\
                        <button type="button" class="btn btn-danger" name="deleteExam" data-id="'+exams+'"><i class="fas fa-trash"></i></button>\
                    </div>'
                }
            }
        ],
        fixedHeader: {
            header: true,
            footer: true
        },
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.11.3/i18n/de_de.json"
        }
    });

    // Set inputs to current Time + 45 Minutes
    var d = new Date();
    // var dd = new Date(d.getTime() + 45*60000);
    /*$('#inputTimeTo').val((dd.getHours()<10?'0'+dd.getHours():dd.getHours())+':'+(dd.getMinutes()<10?'0'+dd.getMinutes():dd.getMinutes()));
    $('#inputTimeFrom').val((d.getHours()<10?'0'+d.getHours():d.getHours())+':'+(d.getMinutes()<10?'0'+d.getMinutes():d.getMinutes()));*/

    // Set inputs to current Date
    var day = ("0" + d.getDate()).slice(-2);
    var month = ("0" + (d.getMonth() + 1)).slice(-2);
    var today = d.getFullYear()+"-"+(month)+"-"+(day) ;
    $('#inputDate').val(today);
});

// Examples to bind values to modal inputs
/*
    $('#editModalAccounts').find('input[name="username"]').val(button.closest('tr').find('td').eq(0).text()); //BIND USERNAME FROM TABLE TO INPUT
    $('#editModalAccounts').find('input[name="firstname"]').val(button.closest('tr').find('td').eq(1).text()); //BIND FIRSTNAME FROM TABLE TO INPUT
    $('#editModalAccounts').find('input[name="lastname"]').val(button.closest('tr').find('td').eq(2).text()); //BIND LASTNAME FROM TABLE TO INPUT
    $('#editModalAccounts').find('input[name="mail"]').val(button.closest('tr').find('td').eq(3).text()); //BIND MAIL ADDRESS FROM TABLE TO INPUT
*/

// Show Modals and bind id from entry to save button
$('#examsTable').on('click', 'button[name="editExam"]', function () {
    let button = $(this);
    $('#changeExamsModal').find('button[name="save"]').attr('data-id', button.attr('data-id')); // BIND USER ID FROM TABLE BUTTON TO SAVE BUTTON
    $('#changeExamsModal').modal('show');
});

$('#examsTable').on('click', 'button[name="deleteExam"]', function () {
    let button = $(this);
    $('#deleteExamsModal').find('button[name="delete"]').attr('data-id', button.attr('data-id')); // BIND USER ID FROM TABLE BUTTON TO SAVE BUTTON
    $('#deleteExamsModal').modal('show');
});

// Wenn das Modal geöffnet wurde, die Klausur laden.
$('#changeExamsModal').on('shown.bs.modal', function() {
    getExam($('#changeExamsModal').find('button[name="save"]').attr('data-id'));
});

// Wenn das Modal geschlossen wurde, die Felder leeren.
$('#changeExamsModal').on('hidden.bs.modal', function() {
    $('#changeExamsModal').find('.overlay').show();

    $('#rbLessonChange').prop('checked', true).trigger('change');

    // Zurückbekommene Werte den Feldern zuteilen
    $('#inputDateChange').val('');
    $('#selectClassChange').val('-');
    $('#selectSubjectChange').val('-');
    $('#inputRoomChange').val('');
    $('#inputTimeFromChange').val('');
    $('#inputTimeToChange').val('');
    $('#selectLessonFromChange').val('-');
    $('#selectLessonToChange').val('-');
    summernoteTopicChange.summernote('code', '');
    summernoteOtherChange.summernote('code', '');

    $('#chkActivateOtherChange').prop('checked', false).trigger('change');
});

$('#deleteExamsModal').find('button[name="delete"]').on('click', function() {
    deleteExam();
});

// Show or hide Other fields
$('#chkActivateOther').on('change', function() {
    if ($('#chkActivateOther').is(':checked')) {
        $('#otherWrapper').show();
    } else {
        $('#otherWrapper').hide();
    }
});

$('#chkActivateOtherChange').on('change', function() {
    if ($('#chkActivateOtherChange').is(':checked')) {
        $('#otherWrapperChange').show();
    } else {
        $('#otherWrapperChange').hide();
    }
});

// Deactivate Inputs if radio button is changed
$('#rbTime').on('change', function() {
    if ($('#rbTime').is(':checked')) {
        $('#inputTimeFrom').prop('disabled', false);
        $('#inputTimeTo').prop('disabled', false);

        $('#selectLessonFrom').prop('disabled', true);
        $('#selectLessonTo').prop('disabled', true);
        $('#selectLessonFrom').val('-');
        $('#selectLessonTo').val('-');
    }
});

$('#rbLesson').on('change', function() {
    if ($('#rbLesson').is(':checked')) {
        $('#selectLessonFrom').prop('disabled', false);
        $('#selectLessonTo').prop('disabled', false);

        $('#inputTimeFrom').prop('disabled', true);
        $('#inputTimeTo').prop('disabled', true);
        $('#inputTimeFrom').val('');
        $('#inputTimeTo').val('');
    }
});

$('#rbTimeChange').on('change', function() {
    if ($('#rbTimeChange').is(':checked')) {
        $('#inputTimeFromChange').prop('disabled', false);
        $('#inputTimeToChange').prop('disabled', false);

        $('#selectLessonFromChange').prop('disabled', true);
        $('#selectLessonToChange').prop('disabled', true);
        $('#selectLessonFromChange').val('-');
        $('#selectLessonToChange').val('-');
    }
});

$('#rbLessonChange').on('change', function() {
    if ($('#rbLessonChange').is(':checked')) {
        $('#selectLessonFromChange').prop('disabled', false);
        $('#selectLessonToChange').prop('disabled', false);

        $('#inputTimeFromChange').prop('disabled', true);
        $('#inputTimeToChange').prop('disabled', true);
        $('#inputTimeFromChange').val('');
        $('#inputTimeToChange').val('');
    }
});

$('#saveExam').on('click', function() {
    saveNewExam();
});

function saveNewExam() {

    let dateValue = $('#inputDate').val();
    let timeFromValue = $('#inputTimeFrom').val();
    let timeToValue = $('#inputTimeTo').val();
    let lessonFromValue = $('#selectLessonFrom option:selected').val();
    let lessonToValue = $('#selectLessonTo option:selected').val();
    let classValue = $('#selectClass option:selected').val();
    let subjectValue = $('#selectSubject option:selected').val();
    let roomValue = $('#inputRoom').val().trim();
    let topicValue = $('#textTopic').summernote('code').replace(/<p[^>]*>/g, ' ').replace(/<\/p>/g, '');
    let otherValue = $('#textOther').summernote('code').replace(/<p[^>]*>/g, ' ').replace(/<\/p>/g, '');

    // Variablen für Fehlermeldung
    let errorMsg = null;
    let timeOrLessonOk = true;
    if (($('#rbTime').is(':checked') && (timeFromValue == "" || timeToValue == "")) || ($('#rbLesson').is(':checked') && (lessonFromValue == "-" || lessonToValue == "-"))) {
        timeOrLessonOk = false;
    }

    let momentFrom = moment(timeFromValue, 'hh:mm');
    let momentTo = moment(timeToValue, 'hh:mm');

    // Fehlermeldung Zeitange (bis) größer als (von) ist.
    if (($('#rbLesson').is(':checked') && (lessonToValue <= lessonFromValue)) || ($('#rbTime').is(':checked') && momentFrom.isAfter(momentTo) || momentFrom.isSame(momentTo))) {
        errorMsg = $('.lessonAndTimeError').html();
    }

    // Fehlermeldung, wenn Datum oder Klasse oder Fach oder Zeit nicht angegeben wurde. 
    if (dateValue == "" || !timeOrLessonOk || classValue == "-" || subjectValue == "-") {
        errorMsg = $('.requiredFields').html();
    }

    if (errorMsg != null) {
        triggerResponseMsg('error', errorMsg);
        return false;
    }

    $.post(
        'src/php/_ajax/ajax.createExam.php',
        {
            data: {
                date: dateValue,
                timeFrom: timeFromValue,
                timeTo: timeToValue,
                lessonFrom: lessonFromValue,
                lessonTo: lessonToValue,
                class: classValue,
                subject: subjectValue,
                room: roomValue,
                topic: topicValue,
                other: otherValue
            },
        },
        function(rtn) {
            try {
                let obj = JSON.parse(rtn);
                if (obj.success) {
                    triggerResponseMsg('success', $('.successCreateExam').html());
                    setTimeout(function(){
                        location.reload();
                    }, 1000);
                } else {
                    triggerResponseMsg('error', $('.errorCreateExam').html());
                }
            } catch(e) {
                console.log(e);
            }
        }
    );
    
}

function getExam(id) {
    $.post(
        'src/php/_ajax/ajax.getExam.php',
        {
            data: {
                id: id
            },
        },
        function (rtn) {
            try {
                let obj = JSON.parse(rtn);
                console.log(obj);
                if (obj.success) {
                    if (obj.exam.lessonFrom && obj.exam.lessonTo) {
                        $('#rbLessonChange').prop('checked', true).trigger('change');
                    } else if (obj.exam.timeFrom && obj.exam.timeTo){
                        $('#rbTimeChange').prop('checked', true).trigger('change');
                    }

                    // Zurückbekommene Werte den Feldern zuteilen
                    $('#inputDateChange').val(obj.exam.date);
                    $('#selectClassChange').val(obj.exam.class_id);
                    $('#selectSubjectChange').val(obj.exam.subject_id);
                    $('#inputRoomChange').val(obj.exam.room);
                    $('#inputTimeFromChange').val(obj.exam.timeFrom);
                    $('#inputTimeToChange').val(obj.exam.timeTo);
                    $('#selectLessonFromChange').val(obj.exam.lessonFrom);
                    $('#selectLessonToChange').val(obj.exam.lessonTo);
                    summernoteTopicChange.summernote('code', obj.exam.topic);

                    if (obj.exam.other) {
                        $('#chkActivateOtherChange').prop('checked', true).trigger('change');
                    }

                    summernoteOtherChange.summernote('code', obj.exam.other);

                    $('#changeExamsModal').find('.overlay').hide();
                } else {
                    triggerResponseMsg('error', $('.errorGetExam').html());
                    $('#changeExamsModal').modal('toggle');
                }
            } catch (e) {
                console.log(e);
                triggerResponseMsg('error', $('.errorGetExam').html());
                $('#changeExamsModal').modal('toggle');
            }
        }
    );
}

function deleteExam() {
    $.post(
        'src/php/_ajax/ajax.deleteExam.php',
        {
            data: {
                id: $('#deleteExamsModal').find('button[name="delete"]').attr('data-id')
            },
        },
        function(rtn) {
            try {
                let obj = JSON.parse(rtn);
                if (obj.success) {
                    triggerResponseMsg('success', $('.successDeleteExam').html());
                    setTimeout(function(){
                        location.reload();
                    }, 1000);
                } else {
                    triggerResponseMsg('error', $('.errorDeleteExam').html());
                }
            } catch(e) {
                console.log(e);
            }
        }
    );
}
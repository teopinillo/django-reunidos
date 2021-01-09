
//when the DOM content of the page has been loaded, we attach 
//event listeners to each of the buttons
const handleSubmit = (e) => {
  e.preventDefault();
  send_mail();
  //load_mailbox('sent')
  //.then (load_mailbox('sent'));  
};

document.addEventListener('DOMContentLoaded', function () {
  console.log("Document Loaded")
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#error_view').addEventListener('click', () => hideError());
  const form = document.querySelector('#compose-form');
  form.addEventListener('submit', handleSubmit);


  console.log(`form: ${form}`);
  // By default, load the inbox
  load_mailbox('inbox');
});

function hide_views_for_compose() {
  // Show compose view and hide other views
  //hides the emails-view
  document.querySelector('#emails-view').style.display = 'none';
  //shows the compose-view
  document.querySelector('#compose-view').style.display = 'block';
  //hides the emails-view
  document.querySelector('#read_view').style.display = 'none';
  document.querySelector('#error_view').style.display = 'none';
}

function compose_email() {
  console.log("===> set compose_email view");
  hide_views_for_compose();
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  console.log("<=== set compose_email view");
}

function reply_email() {
  //get the data to refill
  console.log("function reply_email");
  subject = "RE: " + document.querySelector('#subject').innerText;

  content = document.querySelector('#content').innerText;
  timestamp = document.querySelector('#timestamp').innerText
  sender = document.querySelector('#sender').innerText

  content = `\n\nOn ${timestamp} ${sender} wrote:\n\n` + content
  console.log(`subject: ${subject}`);
  console.log(`conent: ${content}`);
  console.log(`recipients: ${sender}`);

  hide_views_for_compose();

  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = content;
  document.querySelector('#timestamp').value = timestamp;

}

//mark an email as read it
// 11/14/2020 16:33
//
async function markAsRead(email_id) {
  const data = {
    read: true,
  }
  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    host: '10.0.0.124',
    body: JSON.stringify(data),
  }

  const response = await fetch(`/emails/${email_id}`, options);
  console.log(response);
  //const result = await response.json();
  return response;
}

//mark an email as archived
// 11/14/2020 17:07
//
async function archive(email_id, toArchive) {
  const response = await fetch(`/emails/${email_id}`, {
    method: 'PUT', body: JSON.stringify({ archived: toArchive })
  });
  //let data = await response.json();
  return response;
}

async function moveToArchive() {
  console.log("function moveToArchive 11/24/2020")
  const email_id = document.querySelector('#email_id').value;
  archive(email_id, true)
    .then(response => {
      load_mailbox('inbox');
    })
    .catch(error => {
      console.log(error);
    });
  return false;
}

//returns the complete email
async function getEmailBody(email_id) {
  const response = await fetch(`/emails/${email_id}`);
  return await response.json();
}

//=======Display Error Message
//=== 12/4/2020 
function displayError(error) {
  document.querySelector('#error_label').innerText = error;
  document.querySelector('#error_view').style.display = 'block';
}

function hideError() {
  document.querySelector('#error_view').style.display = 'none';
}
//=============================================================SEND EMAIL

async function send_mail() {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  let post_body = JSON.stringify({
    recipients: recipients,
    subject: subject,
    body: body
  });

  fetch('/emails', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    host: '10.0.0.124',
    method: 'POST',
    body: post_body
  })
    .then(response => {
      if (!response.ok) { throw response }
      return response.json()  //only if not error      
    })
    .then(json => {
      //console.log(`. ${json}`);
      load_mailbox('sent');
    })
    .catch(err => {
      console.log(`err: ${err}`);
      if (typeof err === 'error') {
        console.log(`error: ${err}`);
      } else {
        err.json().then(result => {
          console.log(`result:${result}`);
          if (result.hasOwnProperty('error')) {
            alert(result.error);
          }
        })
      }
    })
}

function getSimpleMail(element) {

  const email_id = element.dataset.email_id;
  getEmailBody(email_id)
    .then(body => {
      const sender = body.sender;
      //get the recipients
      const arr_to = body.recipients;
      let r = ""
      arr_to.forEach(element => {
        r += element;
      }
      );
      const subj = body.subject;
      const ts = body.timestamp;
      const content = body.body;
      let archiveButton = '';
      if (body.archived) {
        archiveButton = '<button class="btn btn-sm btn-outline-primary" id="archive" onclick="moveToInbox()" > Unarchive </button>';
      } else {
        archiveButton = '<button class="btn btn-sm btn-outline-primary" id="archive" onclick="moveToArchive()" > Archive </button>';
      }

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#error_view').style.display = 'none';

      const read_view = document.getElementById('read_view');
      read_view.innerHTML = `<b>From: </b><i><spam id="sender">${sender}</spam> </i>
      <br><b>To: </b><spam id="recipients">${r}</spam><br>
      <b>Subject: </b><spam id="subject">${subj}</spam><br>
      <b>Timestamp: </b><spam id="timestamp">${ts}</spam>
      <br><br><button class="btn btn-sm btn-outline-primary" id="reply" onclick="reply_email ()"> Reply </button>
      ${archiveButton}     
      <input type="hidden" id="email_id" name="email_id" value=${body.id}> 
     

      <hr><spam id="content">${content}</spam>`;
      read_view.style.display = 'block';
    })
    .then(markAsRead(email_id))
    .catch(error => {
      console.error(error);
    })
}

//Sending a GET request to /emails/<mailbox> where <mailbox> is either
// inbox, sent, or archive will return back to you (in JSON form) 
//a list of all emails in that mailbox
//async function getMails(mailbox) {
//  console.log(`===> getMails ${mailbox}`);

//  const response = await fetch(`/emails/${mailbox}`);

//  console.log("<=== getMails");
//  return await response.json();
//}

function moveToInbox() {
  //11/24/2020
  const email_id = document.querySelector('#email_id').value;
  archive(email_id, false)
    .then(response => {
      load_mailbox('inbox');
    })
    .catch(error => {
      consoe.log(error);
      alert(error);
    }
    )
  return false;
}

//arguments: inbox | sent | archive
async function load_mailbox(mailbox) {

  //console.log(`load mail view : ${mailbox}`);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#error_view').style.display = 'none';
  //hide compose view
  document.querySelector('#compose-view').style.display = 'none';
  //hide the read view
  document.querySelector('#read_view').style.display = 'none';

  // Show the mailbox name
  //document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#emails-folder').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;

  //Sending a GET request to /emails/<mailbox> where <mailbox> is either
  // inbox, sent, or archive will return back to you (in JSON form) 
  //a list of all emails in that mailbox
  const response = await fetch(`/emails/${mailbox}`);
  if (response.ok) {
    const emails = await response.json();

    if (emails) {
      const star = '<td class="action"><i class="fa fa-star"></i></td>';

      const emails_table = document.getElementById("emails-table");
      emails_table.innerHTML = "";
      emails.forEach(element => {

        const tr = document.createElement('tr');
        if (element.read) {
          tr.className = "read"
        } else {
          tr.className = ""
        }
        if (mailbox == "sent") {
          tr.innerHTML = `${star}<td class="name" onclick="return getSimpleMail(this)" data-email_id=${element.id}><a href="#">${element.recipients}</a></td><td class="subject"><a href="#">${element.subject}</a></td><td class="time">${element.timestamp}</td>`
        } else {
          tr.innerHTML = `${star}<td class="name" onclick="return getSimpleMail(this)" data-email_id=${element.id}><a href="#">${element.sender}</a></td><td class="subject"><a href="#">${element.subject}</a></td><td class="time">${element.timestamp}</td>`
        }
        emails_table.append(tr);
      })  //end loop
    } //end if
  } else {
    console.error(`[load_mailbox 317] error: ${response.text()}`);
  }
}


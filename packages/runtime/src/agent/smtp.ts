export class SmtpAgent {
  async connect(
    host: string,
    username?: string,
    password?: string
  ): Promise<SmtpAgentHub> {
    let credential = null;
    if (username !== null && password != null) {
      credential = { username, password };
    }

    const uid = await Deno.core.opAsync("op_smtp_agent_connect", {
      host,
      credential,
    });

    return new SmtpAgentHub(uid);
  }
}

export class SmtpAgentHub {
  constructor(readonly uid: string) {}

  async send(mail: Smtp.Mail) {
    if (mail.sender.mail === null) {
      throw new TypeError("mail sender should not be empty");
    }
    if (mail.receivers.length === 0) {
      throw new TypeError("mail receivers should not be empty");
    }
    if (mail.subject.length === 0) {
      throw new TypeError("mail subject should not be empty");
    }
    if (mail.body.length === 0) {
      throw new TypeError("mail body should not be empty");
    }

    return Deno.core.opAsync("op_smtp_agent_send", { uid: this.uid, mail });
  }
}

export namespace Smtp {
  export interface MailBox {
    name: string;
    mail: string;
  }

  export class Mail {
    sender: MailBox;
    receivers: MailBox[];
    replyTo?: MailBox;
    cc: MailBox[];
    bcc: MailBox[];
    subject: string;
    body: string;

    constructor() {
      this.sender = { mail: "", name: "" };
      this.receivers = [];
      this.replyTo = undefined;
      this.cc = [];
      this.bcc = [];
      this.subject = "";
      this.body = "";
    }

    setSender(mail: string, name: string = "") {
      this.sender = { mail, name };
      return this;
    }

    setReceivers(mail: string, name: string = "") {
      this.receivers.push({ mail, name });
      return this;
    }

    setReplyTo(mail: string, name: string = "") {
      this.replyTo = { mail, name };
      return this;
    }

    setCC(mail: string, name: string = "") {
      this.cc.push({ mail, name });
      return this;
    }

    setBCC(mail: string, name: string = "") {
      this.bcc.push({ mail, name });
      return this;
    }

    setSubject(subject: string) {
      this.subject = subject;
      return this;
    }

    setBody(body: string) {
      this.body = body;
      return this;
    }
  }
}

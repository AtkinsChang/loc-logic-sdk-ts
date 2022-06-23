import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestFileStorage extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestFileStorage");

    await this.testFtp();
    await this.testFilesystem();
  }

  async testFtp() {
    let urlOne = "ftp://myuser:mypass@127.0.0.1/test_dir/test_file_1.txt";
    // data: "put to ftp server"
    let originDataOne = new Uint8Array([
      112, 117, 116, 32, 116, 111, 32, 102, 116, 112, 32, 115, 101, 114, 118,
      101, 114,
    ]);
    await this.context.agents.fileStorage?.simplePut(urlOne, originDataOne);
    await this.context.agents.sessionStorage.putByteArray(
      "originDataOne",
      originDataOne
    );
    let receivedDataOne = await this.context.agents.fileStorage?.simpleGet(
      urlOne
    );
    await this.context.agents.sessionStorage.putByteArray(
      "receivedDataOne",
      receivedDataOne!
    );

    let urlTwo = "ftp://myuser:mypass@127.0.0.1/test_dir/test_file_2.txt";
    // data: "this project is called saffron"
    let originDataTwo = new Uint8Array([
      116, 104, 105, 115, 32, 112, 114, 111, 106, 101, 99, 116, 32, 105, 115,
      32, 99, 97, 108, 108, 101, 100, 32, 115, 97, 102, 102, 114, 111, 110,
    ]);
    await this.context.agents.fileStorage?.simplePut(urlTwo, originDataTwo);
    await this.context.agents.sessionStorage.putByteArray(
      "originDataTwo",
      originDataTwo
    );
    let receivedDataTwo = await this.context.agents.fileStorage?.simpleGet(
      urlTwo
    );
    await this.context.agents.sessionStorage.putByteArray(
      "receivedDataTwo",
      receivedDataTwo!
    );

    let urlThree = "ftp://myuser:mypass@127.0.0.1/test_dir/test_file_3.txt";
    // data: "hello FST network"
    let originDataThree = new Uint8Array([
      104, 101, 108, 108, 111, 32, 70, 83, 84, 32, 110, 101, 116, 119, 111, 114,
      107,
    ]);
    await this.context.agents.fileStorage?.simplePut(urlThree, originDataThree);
    await this.context.agents.sessionStorage.putByteArray(
      "originDataThree",
      originDataThree
    );
    let receivedDataThree = await this.context.agents.fileStorage?.simpleGet(
      urlThree
    );
    await this.context.agents.sessionStorage.putByteArray(
      "receivedDataThree",
      receivedDataThree!
    );
  }

  async testFilesystem() {
    let url = "smb://user@BOUND_HOSTNAME/sharing/r_file.txt";
    let content = Deno.core.encode(`write r_file.txt`);
    await this.context.agents.fileStorage?.simplePut(url, content);

    let result = await this.context.agents.fileStorage?.simpleGet(url);
    await this.context.agents.sessionStorage.putByteArray(
      "fileTestReceivedData",
      result!
    );

    url = "smb://user@BOUND_HOSTNAME/sharing/not_exist/r_file.txt";
    content = Deno.core.encode(`write not_exist/r_file.txt`);
    await this.context.agents.fileStorage?.simplePut(url, content, {
      ensureDir: true,
    });

    result = await this.context.agents.fileStorage?.simpleGet(url);
    await this.context.agents.sessionStorage.putByteArray(
      "fileTestReceivedData2",
      result!
    );

    url = "smb://user@BOUND_HOSTNAME/sharing/not_exist/new_dir";
    await this.context.agents.fileStorage?.createDirAll(url);

    // NOTE: this is a mock response not a real test
    url = "smb://user@BOUND_HOSTNAME/sharing/not_exist";
    const listResponse = await this.context.agents.fileStorage?.list(url);
    await this.context.agents.sessionStorage.putJson(
      "fileTestReceivedListResponse",
      listResponse
    );

    url = "smb://user@BOUND_HOSTNAME/sharing/not_exist/r_file.txt";
    await this.context.agents.fileStorage?.delete(url);
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}

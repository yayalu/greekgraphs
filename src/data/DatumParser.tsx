import React from "react";

type DatumProps = {};
type DatumState = { data: "" };

class DatumParser extends React.Component<DatumProps, DatumState> {
  constructor(props: any) {
    super(props);
    fileInput = React.createRef();
  }

  handleReadCSV(data: any) {
    console.log(data);
  }

  handleOnError(err: any) {
    console.log(err);
  }

  handleImportOffer = () => {
    this.fileInput.current.click();
  };

  render() {
    return (
      <div>
        <CSVReader
          onFileLoaded={this.handleReadCSV}
          inputRef={this.fileInput}
          style={{ display: "none" }}
          onError={this.handleOnError}
        />
        <button onClick={this.handleImportOffer}>Import</button>
      </div>
    );
  }
}

export default DatumParser;

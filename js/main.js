$("#searchButton").on('click', function () {
    console.log("searchButtonクリックされました");

    axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: "転スラ" }
    }).then(res => {
        console.log(res.data);
    });

})

// $("#searchButton").on('click', function () {
//     console.log("searchButtonクリックされました");
//     const queryText = `title=${$("#searchWord").val()} AND ndc=913.6 AND sortBy=issued_date/sort.descending`;
//     console.log(queryText);
//     axios.get("https://ndlsearch.ndl.go.jp/api/sru", {
//         params: {
//             operation: "searchRetrieve", // API仕様書に必ずつけろと書いてあったので
//             query: queryText, // 検索条件（ISBNの時はハイフンがいる）
//             recordSchema: "dc", // 取得データのスキーマ（ちょっとよくわからない）
//             recordPacking: "xml" // 取得したデータの形（JSON形式で取れない）
//         },
//         responseType: "text"
//     })
//         .then(response => {
//             // response.data はオブジェクトをjsonにしたみたいに
//             // オブジェクトをhtmlで作って全部文字列にしたデータのようなもの→xml
//             // console.log("response", response);
//             // console.log("response.data", response.data);
//             // 検索条件がここに出る
//             // console.log("response.config.params.query", response.config.params.query);
//             const parser = new DOMParser();
//             const xml = parser.parseFromString(response.data, "text/xml");
//             // console.log("xml",xml);
//             const book = parseDc(xml);
//             console.log("book", book);
//             // title creator publisher

//             // いったんHTMLで表示してみる
//             $("#numberOfMatches").text("検索ヒット数：" + book.length + "件");
//             let html = "";
//             for (let i = 0; i < book.length; i++) {
//                 // console.log("book[i]",book[i]);
//                 html += `
//                     <li>
//                         <ul>${book[i].title}</ul>
//                         <ul>${book[i].creator}</ul>
//                         <ul>${book[i].publisher}</ul>
//                     </li>
//                     `
//             }
//             $("#result").html(html);
//         });
// })



// // xmlデータを受け取って、オブジェクト配列に変換して返す関数
// function parseDc(xml) {
//     // 名前空間の指定 これがないとセレクタだけ受け取っても判定できないらしい
//     // Dublin Core（dc:）という名前空間を表す「識別子（URI）」を変数に入れている
//     const DC_NS = "http://purl.org/dc/elements/1.1/";
//     // xmlの中のrecordDataのタグの中身だけ取得する（スコープで分けて管理しやすくする）
//     const recordData = xml.getElementsByTagName("recordData");
//     console.log("xml", xml);
//     console.log('recordData.length', recordData.length);
//     // console.log("recordData", recordData);

//     // 一件あたりのオブジェクトを配列に入れる
//     const recordsData = [];
//     for (let i = 0; i < recordData.length; i++) {
//         recordsData[i] = {
//             title:
//                 recordData[i]?.getElementsByTagNameNS(DC_NS, "title")[0]?.textContent ?? null,
//             creator:
//                 recordData[i]?.getElementsByTagNameNS(DC_NS, "creator")[0]?.textContent ?? null,
//             publisher:
//                 recordData[i]?.getElementsByTagNameNS(DC_NS, "publisher")[0]?.textContent ?? null,
//             // language:
//             // recordData[i]?.getElementsByTagNameNS(DC_NS, "language")[0]?.textContent ?? null,
//         };
//     }

//     return recordsData;
// }



















// const queryText = "title=転生したらスライムだった件 AND ndc=913.6";
// // title=転生したらスライムだった件
// // isbn=978-4-86716-873-8
// // ndc=913.6

// axios.get("https://ndlsearch.ndl.go.jp/api/sru", {
//     params: {
//         operation: "searchRetrieve", // API仕様書に必ずつけろと書いてあったので
//         query: queryText, // 検索条件（ISBNの時はハイフンがいる）
//         recordSchema: "dc", // 取得データのスキーマ（ちょっとよくわからない）
//         recordPacking: "xml" // 取得したデータの形（JSON形式で取れない）
//     },
//     responseType: "text"
// })
//     .then(response => {
//         // response.data はオブジェクトをjsonにしたみたいに
//         // オブジェクトをhtmlで作って全部文字列にしたデータのようなもの→xml
//         // console.log("response", response);
//         // console.log("response.data", response.data);
//         // 検索条件がここに出る
//         // console.log("response.config.params.query", response.config.params.query);
//         const parser = new DOMParser();
//         const xml = parser.parseFromString(response.data, "text/xml");
//         // console.log("xml",xml);
//         const book = parseDc(xml);
//         console.log("book", book);
//     });

// // ---------------------------------------------------------------------------------
// // 使っているAPIがJSON形式がなくてxmlだけだった
// // そもそもxmlのデータはオブジェクトデータをhtmlのタグで書いたような構造で、テキストデータ（らしい）
// // axios.get( ... ).then(function(response){ ... }) ってやるとき、response.dataの中身が'<...>' みたいなの
// // const parser = new DOMParser();
// // const xml = parser.parseFromString(response.data, "text/xml");
// // この二つの処理は文字列のデータをDOMのdocumentに変換する処理
// // 必要なデータを抜き取って自前でオブジェクト化する作業が必要
// // 以下、その処理をまとめ、関数化してあります
// // ---------------------------------------------------------------------------------

// // xmlデータと必要な情報のセレクタを受け取って、抜き取って返す関数
// function text(xml, selector) {
//     return xml.querySelector(selector)?.textContent ?? null;
// }

// // xmlデータを受け取って、Bookオブジェクトに変換して返す関数
// function parseDc(xml) {
//     // 名前空間の指定 これがないとセレクタだけ受け取っても判定できないらしい
//     // Dublin Core（dc:）という名前空間を表す「識別子（URI）」を変数に入れている
//     const DC_NS = "http://purl.org/dc/elements/1.1/";
//     // xmlの中のrecordDataのタグの中身だけ取得する（スコープで分けて管理しやすくする）
//     const recordData = xml.getElementsByTagName("recordData")[0];
//     // console.log("xml", xml);
//     // console.log("recordData", recordData);

//     return {
//         title:
//             recordData?.getElementsByTagNameNS(DC_NS, "title")[0]?.textContent ?? null,
//         creator:
//             recordData?.getElementsByTagNameNS(DC_NS, "creator")[0]?.textContent ?? null,
//         publisher:
//             recordData?.getElementsByTagNameNS(DC_NS, "publisher")[0]?.textContent ?? null,
//         language:
//             recordData?.getElementsByTagNameNS(DC_NS, "language")[0]?.textContent ?? null,
//     };
// }

// // ---------------------------------------------------------------------------------
// // 外部の検索サイト（国立国会図書館サーチ）の検索結果をJSONデータでダウンロードして利用する
// // axiosを使って持ってきて確認していたがなかなかうまくいかない
// // axios.get("./data/ndl.json").then(function(response){ ... })
// // ここのresponse.dataに情報が入っているがaxiosで持ってきたデータはJSON.parseされてると思っていたので詰まった
// // response.data の中身は 文字列 だった console.log(typeof response.data); が文字列判定だった
// // JSON Lines（NDJSON / JSONL）形式といわれる １行ごとにJSONファイルが分かれているものだった
// // ※取得したJSONファイルをコンソールで出して、改行されてたら注意！
// // ---------------------------------------------------------------------------------


// axios.get("./data/ndl.json")
//     .then(function (response) {

//         const text = response.data;   // ← 文字列 JSON形式文字列が、改行されて連なっている そのままparseできない
//         const a = text.split('\n'); // 改行文字ごとに分けて配列にする
//         // console.log("text.split('\n')", a); // 配列の要素一つ一つはJSON形式文字列
//         // console.log("text.split('\n').length", a.length); // 実際に最後の配列が空だった

//         // filter(line => line.trim() !== '') をつけることで、からっぽの行を除いた配列にする
//         const lines = text.split('\n').filter(line => line.trim() !== '');

//         // const newData = array.map(n => n*2)
//         // で、同じ長さの配列を作って配列の各要素(n)に何かしらの操作を加えた(n*2)を当てはめる
//         // 下の処理で、配列一つずつをJSON.parse()してオブジェクトデータに変更した配列を作っている
//         const items = lines.map(line => JSON.parse(line));

//         // console.log(Array.isArray(items)); // true
//         // console.log(items.length);         // 件数
//         // console.log(items[0]);             // 1件目
//         const num = 1; // 何件目か
//         console.log("データ全体",items.length);
//         console.log("著者",items[num].dc_creator[0].name);       // 著者
//         console.log("isbn",items[num].identifier.ISBN[0]);       // isbn
//         console.log("出版社",items[num].publisher[0].name);        // 出版社
//         console.log("レーベル",items[num].seriesTitle[0].value);     // レーベル
//         console.log("タイトル",items[num].title[0].value);           // タイトル
//         console.log("タイトル（カタカナ）",items[num].title[0].transcription);   // タイトル（カナ）
//         // console.log("巻数",items[num].volume[0]);                // 巻数

//     });
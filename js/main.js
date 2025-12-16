// =====================================
// ページ読み込み時の処理
// =====================================

// ページ更新時に保存したデータの一覧表示を行い、取得したデータを保存する
// 保存するための空の配列
let favoriteBookList = [];
// 保存したデータをとってきて上の配列に入れつつ表示まで行う
loadBookList();

// ボタンの見た目をjQuery UI で設定
$(".button").button();



// =====================================
// 検索ボタンがクリックされたとき
// =====================================

// データ格納用の空配列
let selectionData = [];
$("#searchButton").on('click', async function () {
    // await処理中にボタンの表示を変える
    $("#searchButton").text("検索中・・・");
    // selectionData初期化
    selectionData.splice(0, selectionData.length);
    console.log("searchButtonクリックされました");
    const queryText = $("#searchWord").val();
    // 検索ワードをAPIに投げる 今回は楽天のアプリケーションIDが必要だった
    // Vercelを使ってキーを秘匿します
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001017" }
    }).then(res => {
        console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
        selectionData = sortData(originalData);
        console.log("selectionData一回目", selectionData);


    });

    // ジャンル指定がもう一つしないと抜けが多かったので追加
    await axios.get("https://kadai05-api-kohl.vercel.app/api/rakuten", {
        params: { title: queryText, booksGenreId: "001004008" }
    }).then(res => {
        console.log(res.data.Items);
        const originalData = res.data.Items;

        // 検索結果から必要なデータを抜いて、前の条件で検索したものに統合する
        selectionData = selectionData.concat(sortData(originalData));
        console.log("selectionData二回目", selectionData);

        // 検索終わったので元に戻す
        $("#searchButton").text("検索");

        // 配列を渡して中身を描画してくれる関数
        viewData(selectionData);
    });

})



// =====================================
// お気に入りゾーンにドロップされたときの処理（データ保存する）
// =====================================

$("#favorite").droppable({
    drop: async function (e, ui) {

        // ドラッグしてきた要素の情報を格納
        const $original = ui.draggable;
        // 何番目の要素かを取得
        const index = $(".viewBlock").index($original);
        // 確認
        console.log("何番目のviewBlockか:", index);
        console.log("対応する検索結果情報:", selectionData[index]);

        // save.js経由でVercelを使って、APIキーを秘匿しながら保存処理
        await axios.post("https://kadai05-api-kohl.vercel.app/api/save",
            selectionData[index],
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(() => {
                alert("保存しました！");
                loadBookList(); // 保存リスト更新
            }).catch(err => {
                console.error(err);
            });
    }
});



// =====================================
// お気に入り削除ボタンクリック時の処理（データ削除）
// =====================================
$(document).on("click", ".deleteBtn", function () {
    console.log("削除ボタンクリックされました");

    // deleteBtnに持たせていたisbnの情報を取得（FirebaseのIDになる）
    const isbn = $(this).data("isbn");

    // 削除は特に誤操作したくないと思うのでポップアップ出します
    if (!confirm("削除しますか？")) return;

    // delete.js経由してVercel使って、API秘匿しながらデータベース削除
    axios.delete("https://kadai05-api-kohl.vercel.app/api/delete", {
        params: { isbn }
    })
        .then(() => {
            alert("削除しました");
            $("#detailedInformation").html(""); // 詳細画面クリア
            $("#detailedInformation").css('display', 'none'); // 画面も消す
            loadBookList(); // 再読み込み
        })
        .catch(err => {
            console.error(err);
        });
});



// =====================================
// 保存済みデータクリック時の処理（詳細情報、コメント記入欄表示）
// =====================================
$(document).on("click", ".book", function () {

    console.log("保存済みデータクリックされました");
    // 保存リスト何番目か取得
    const index = $(".book").index(this);
    console.log("何番目か：", index);
    // 親要素の横幅に合わせて表示するために現在の幅を取得
    const parentWidth = $("#view").width();
    console.log("parentWidth", parentWidth);

    // 詳細情報画面を表示する
    $("#detailedInformation").css('display', 'block');
    $("#detailedInformation").css('width', parentWidth);
    $("#detailedInformation").css('z-index', '100');

    // htmlの中身を作成する
    let html =
        `<div>
            <p>${favoriteBookList[index].title}</p>
            <div><img src="${favoriteBookList[index].largeImageUrl}" alt="${favoriteBookList[index].title}の表紙"></div>
            <p>${favoriteBookList[index].author}</p>
            <p>${favoriteBookList[index].itemCaption}</p>
            <p>${favoriteBookList[index].publisherName}</p>
            <p>${favoriteBookList[index].salesDate}</p>
            <p>${favoriteBookList[index].seriesName}</p>
        </div>
        <div>
            <p id="comment">`;
    console.log("favoriteBookList[index].comment", favoriteBookList[index].comment);
    // commentの情報があるときは表示する
    if (favoriteBookList[index].comment) {
        html += favoriteBookList[index].comment;
    }
    html +=
        `</p>
            <div><input id="commentText" type="textarea" class="textInput"></div>
            <div>
                <button class="commentBtn button" data-index=${index}>コメントする</button>
                <button class="commentDeleteBtn button" data-index=${index}>コメント削除</button>
                <button class="deleteBtn button" data-isbn="${favoriteBookList[index].isbn}">お気に入りから削除</button>
                <button class="closeBtn button">詳細画面を閉じる</button>
            </div>
        </div>
        `;

    // 詳細画面にhtmlを反映する
    $("#detailedInformation").html(html);

    // 作成したボタンをUIデザインに変更する
    $(".button").button();
});



// =====================================
// コメントボタンクリック時の処理（データ追加）
// =====================================
$(document).on("click", ".commentBtn", async function () {

    console.log("コメントボタンクリックされました");

    // 保存中にボタンの表示を変更する
    $(".commentBtn").text("保存中・・・");

    // インデックス番号取得
    const index = $(this).data("index");
    console.log("index", index);

    // オブジェクトデータのコメントを入力内容で更新する
    favoriteBookList[index].comment = $('#commentText').val();
    console.log(favoriteBookList[index].comment); // ちゃんと入ってるの確認しました

    // データ更新
    // save.js経由でVercelを使って、APIキーを秘匿しながら保存処理
    await axios.post("https://kadai05-api-kohl.vercel.app/api/save",
        favoriteBookList[index],
        {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => {
            alert("保存しました！");
            $("#comment").text(favoriteBookList[index].comment); // コメント欄に表示
            $('#commentText').val(""); // 入力欄クリア
            $(".commentBtn").text("コメントする"); // 保存終わったのでボタンの表示を戻す
            loadBookList(); // 保存リスト更新
        }).catch(err => {
            console.error(err);
        });
});



// =====================================
// コメント削除クリック時の処理（commentデータを空文字で上書き）
// =====================================
$(document).on("click", ".commentDeleteBtn", async function () {

    console.log("コメント削除クリックされました");

    // 削除中にボタンの表示を変更
    $(".commentDeleteBtn").text("削除中・・・");

    // インデックス番号取得
    const index = $(this).data("index");
    console.log("index", index);
    favoriteBookList[index].comment = ""; // 空文字で上書き
    console.log(favoriteBookList[index].comment); // ちゃんと消えてるの確認しました    

    // データ更新
    // save.js経由でVercelを使って、APIキーを秘匿しながら保存処理
    await axios.post("https://kadai05-api-kohl.vercel.app/api/save",
        favoriteBookList[index],
        {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(() => {
            alert("削除しました！");
            $("#comment").text(""); // コメント欄もクリア
            $(".commentDeleteBtn").text("コメント削除"); // 削除終了でボタンの表示を戻す
            loadBookList(); // 保存リスト更新
        }).catch(err => {
            console.error(err);
        });
});


// =====================================
// 閉じるボタンクリック時の処理（詳細画面クリアして閉じる）
// =====================================
$(document).on("click", ".closeBtn", async function () {
    $("#detailedInformation").html("");
    $("#detailedInformation").css('display', 'none');
});


// =====================================
// 以下、関数まとめ
// =====================================

// 検索結果の配列を渡すと、必要な情報だけ引っこ抜いた配列を返してくれる関数
function sortData(data) {

    // 格納用の空配列作成
    const newData = [];

    // データの数だけ回して必要な情報だけ抜き取る
    for (let i = 0; i < data.length; i++) {
        newData[i] = {
            author: data[i].Item.author,
            authorKana: data[i].Item.authorKana,
            isbn: data[i].Item.isbn,
            itemCaption: data[i].Item.itemCaption,
            largeImageUrl: data[i].Item.largeImageUrl,
            publisherName: data[i].Item.publisherName,
            salesDate: data[i].Item.salesDate,
            seriesName: data[i].Item.seriesName,
            title: data[i].Item.title,
            titleKana: data[i].Item.titleKana,
            comment: "" // コメントを空で用意しておく
        }
    }
    return newData;
}

// 検索結果の配列を渡して中身を描画してくれる関数
function viewData(data) {

    // 何件ヒットしたかを表示
    $("#numberOfMatches").text("検索ヒット数：" + data.length + "件");

    // 検索結果のhtmlを作成
    let html = "";
    for (let i = 0; i < data.length; i++) {
        html += `
            <div class="viewBlock">
                <p>${data[i].title}</p>
                <div><img src="${data[i].largeImageUrl}" alt="${data[i].title}の表紙"></div>
                <p>${data[i].author}</p>
                <p>${data[i].itemCaption}</p>
                <p>${data[i].publisherName}</p>
                <p>${data[i].salesDate}</p>
                <p>${data[i].seriesName}</p>
            </div>
            `
    }
    // htmlを反映
    $("#result").html(html);

    // ここで作った要素なのでここでドラッグできるように設定する
    $(".viewBlock").draggable({
        helper: "clone", // クローンがドラッグされるようにする
        start: function (e, ui) {
            ui.helper.width($(this).width()); // クローンはbody直下に生成されるらしいので
            ui.helper.height($(this).height()); // %指定だとサイズがおかしくなるので元データのサイズを継承
        }
    });
}

// firebaseに保存されてるデータを全権取得する関数
// 内部で一覧表示する関数を使って表示まで行う
// 全権取得したデータを戻り値で返す（ほかのところで操作できるように）
function loadBookList() {
    console.log("読み込み開始");
    // list.jsを使ってVercel経由でAPI秘匿
    axios.get("https://kadai05-api-kohl.vercel.app/api/list")
        .then(res => {
            console.log("res.data", res.data);
            // 受け取ったデータを表示する関数
            renderBookList(res.data);
            favoriteBookList = res.data; // ローカルデータも更新
            console.log(favoriteBookList);
        })
        .catch(err => {
            console.error(err);
        });
}

// 受け取った保存データを一覧表示する関数
function renderBookList(list) {
    $("#bookList").empty(); // いったん中身消す

    list.forEach(book => {
        $("#bookList").append(`
            <div class="book" data-isbn="${book.isbn}">
                <p>${book.title}</p>
                <p>${book.author}</p>
                <img src="${book.largeImageUrl}">
            </div>
        `);
    });
}






















// =============================================================================
// 国立国会図書館APIを使っていた時の残骸
// xmlデータから必要な情報を抜き出す処理とかでめちゃ苦労したので
// 後々参考にできるようにどこかにまとめなおすため取っておきます
// =============================================================================

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

// ==========================================================================

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

// ==========================================================================

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




// =============================================================================
// こっちは外部JSONデータをローカルに保存しておいて、そこからデータを取り出す処理
// JSON Lines（NDJSON / JSONL）形式といわれる １行ごとにJSONファイルが分かれているものだった
// これもどこかにまとめなおすために残しときます
// =============================================================================

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
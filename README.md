# BUTSURY-DAYS
2025年度入班デモンストレーション展示用<br/>
実在する決済システムとは一切関係がありません。<br/>
本家の関係者の方々、大変申し訳ありません。

## 起動方法 (開発環境)
クライアント側
```
cd client
npm run dev
```

サーバー側
```
cd server
go run main.go ... (全部のファイル名書いてください。以下略)
```

## ビルド方法
クライアント側
```
cd client
npm run build
```

サーバー側
```
cd server
go build .
```

## リーダー機 URL
リーダー機説明<br/>
stop_id: 整理券番号<br/>
type_id: 種別<br/>
company_id: 会社ID<br/>

> 整理券番号1 物理化学第二実験室<br/>
> https://butsury-days.shudo-physics.com/reader?stop_id=1&type_id=1&company_id=1

> 整理券番号2 物理班<br/>
> https://butsury-days.shudo-physics.com/reader?stop_id=2&type_id=1&company_id=1

> 整理券番号3 鉄道研究班<br/>
> https://butsury-days.shudo-physics.com/reader?stop_id=3&type_id=1&company_id=1

> 整理券番号4 ジャグリング同好会<br/>
> https://butsury-days.shudo-physics.com/reader?stop_id=4&type_id=1&company_id=1

## .env 説明
```
SECRET=

DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_ADDRESS=
DATABASE_PROTOCOL=

PORT=8080
```

DSNはデータベース接続のおまじない
例: `USERNAME:PASSWORD@(localhost:3306)/butsury_days`
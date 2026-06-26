g-Lab. 宝石ゲーム v85 最終花セット 更新手順

今回の花（むつかしいモード）
- 梅（サイズは前回より12%小さい）
- 芍薬
- 菊
- 牡丹

この更新では、古い花ファイル名（marguerite.png / gerbera.png / rose.png / lily.png）にも同じ新花画像を入れています。
そのため、古いキャッシュが残っていた場合でも、古い花の絵が再表示されにくくなります。

コピーするもの
1. app.js
2. index.html
3. service-worker.js
4. assets フォルダの中身

重要：
- 解凍した assets フォルダを、既存の assets フォルダへ「結合」してください。
- flower-assets フォルダの中の 8 ファイルは、すべて置き換えを選んでください。
- フォルダごと二重に作らないよう、コピー先は g-lab-gem-game-github-pages の直下です。

コピー後、GitHub Desktopで Commit → Push origin。
公開ページは一度閉じ、もう一度開いて再読み込みしてください。

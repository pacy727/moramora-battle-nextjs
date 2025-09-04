interface TitleScreenProps {
    onStartGame: () => void
  }
  
  export default function TitleScreen({ onStartGame }: TitleScreenProps) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          {/* メインタイトル */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              ⚗️ モラモラバトル ⚗️
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-semibold mb-2">
              高校化学基礎のmol計算学習ゲーム
            </p>
          </div>
  
          {/* コンパクトなルール説明 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <h3 className="text-blue-300 font-semibold mb-1">🎯 目標</h3>
                <p className="text-white/80 text-sm">先に3ポイント獲得</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3">
                <h3 className="text-green-300 font-semibold mb-1">⏱️ 制限時間</h3>
                <p className="text-white/80 text-sm">各ラウンド10秒</p>
              </div>
  
              <div className="bg-white/5 rounded-xl p-3">
                <h3 className="text-yellow-300 font-semibold mb-1">🧪 学習内容</h3>
                <p className="text-white/80 text-sm">mol計算・分子量・体積</p>
              </div>
            </div>
          </div>
  
          {/* サンプルカード表示 */}
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-bold text-white mb-3">
              💳 カードの例
            </h3>
            <div className="flex justify-center gap-3">
              <div className="bg-gradient-to-br from-white to-gray-100 text-gray-800 p-3 rounded-xl shadow-lg text-center min-w-[80px]">
                <div className="text-sm font-bold mb-1">H₂O</div>
                <div className="text-xs text-gray-600">18g</div>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-100 text-gray-800 p-3 rounded-xl shadow-lg text-center min-w-[80px]">
                <div className="text-sm font-bold mb-1">CO₂</div>
                <div className="text-xs text-gray-600">1.2mol</div>
              </div>
              <div className="bg-gradient-to-br from-white to-gray-100 text-gray-800 p-3 rounded-xl shadow-lg text-center min-w-[80px]">
                <div className="text-sm font-bold mb-1">O₂</div>
                <div className="text-xs text-gray-600">22.4L</div>
              </div>
            </div>
          </div>
  
          {/* スタートボタン */}
          <button
            onClick={onStartGame}
            className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-full text-lg md:text-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 hover:scale-105 animate-pulse-glow"
          >
            🚀 ゲームスタート！
          </button>
  
          {/* フッター情報 */}
          <div className="mt-4 text-white/60 text-xs">
            <p>お題に最適なカードを選んで勝利を目指そう！</p>
          </div>
        </div>
      </div>
    )
  }
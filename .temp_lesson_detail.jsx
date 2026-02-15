// LESSON DETAIL VIEW - 5 ta sahifa (Video, Amaliy, Nazariy, Uyga, Test)
{
    view === 'lesson-detail' && selectedLesson && selectedLevel && (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView('module-detail')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className={`inline-block px-4 py-1 rounded-lg bg-gradient-to-r ${selectedLevel.color} text-white font-bold text-xs mb-2`}>
                        {selectedLevel.icon} {selectedLevel.id}
                    </div>
                    <h2 className="text-3xl font-black">{selectedLesson.title}</h2>
                    <p className="text-white/60 text-sm">5 sahifa • Professional</p>
                </div>
            </div>

            {/* 5 Sahifa Tabs */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10">
                <div className="flex overflow-x-auto gap-2">
                    {[
                        { id: 'video', label: '📹 Video Dars' },
                        { id: 'amaliy', label: '📝 Amaliy (100b)' },
                        { id: 'nazariy', label: '📖 Nazariy' },
                        { id: 'uyga', label: '✍️ Uyga (100b)' },
                        { id: 'test', label: '📊 Test (100b)' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setLessonTab(tab.id)}
                            className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${lessonTab === tab.id
                                    ? 'bg-white text-black shadow-lg'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 min-h-[500px]">
                {lessonTab === 'video' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black">📹 Video Dars</h3>
                        <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <Play size={64} className="text-white group-hover:scale-110 transition-transform z-10" fill="white" />
                            <p className="absolute bottom-6 left-6 text-white font-bold z-10">Professional video dars</p>
                        </div>
                    </div>
                )}

                {lessonTab === 'amaliy' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black">📝 Amaliy Vazifalar (100 ball)</h3>
                        <div className="bg-white/5 p-6 rounded-2xl">
                            <p className="text-white/80">Admin paneldan amaliy topshiriqlar qo'shiladi.</p>
                        </div>
                    </div>
                )}

                {lessonTab === 'nazariy' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black">📖 Nazariy Qism</h3>
                        <div className="bg-white/5 p-8 rounded-2xl">
                            <p className="text-white/80 text-lg">Batafsil nazariy qism bu yerda.</p>
                        </div>
                    </div>
                )}

                {lessonTab === 'uyga' && (
                    <div className="space-y-6 text-center py-12">
                        <Download size={64} className="mx-auto text-emerald-400" />
                        <h3 className="text-2xl font-black">✍️ Uyga Vazifa (100 ball)</h3>
                        <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                            Vazifa Yuklash
                        </button>
                    </div>
                )}

                {lessonTab === 'test' && (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Brain size={48} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">📊 Test (100 ball)</h3>
                        <button className="bg-white text-black px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform">
                            Testni Boshlash
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

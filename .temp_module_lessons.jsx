// MODULE LESSONS VIEW - 5 ta dars ko'rsatadi
{
    view === 'module-detail' && selectedModule && selectedLevel && (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setView('level-lessons')}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <div className={`inline-block px-4 py-1 rounded-lg bg-gradient-to-r ${selectedLevel.color} text-white font-bold text-xs mb-2`}>
                        {selectedLevel.icon} {selectedLevel.id}
                    </div>
                    <h2 className="text-3xl font-black">{selectedModule.title}</h2>
                    <p className="text-white/60 text-sm">5 ta dars</p>
                </div>
            </div>

            {/* 5 ta Dars Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5].map((lessonNum) => (
                    <div
                        key={lessonNum}
                        onClick={() => {
                            setSelectedLesson({ id: lessonNum, title: `Dars ${lessonNum}` });
                            setLessonTab('video');
                            setView('lesson-detail');
                        }}
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/20 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all"
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-gradient-to-br ${selectedLevel.color} text-white`}>
                                    {lessonNum}
                                </div>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-black text-xl">Dars {lessonNum}</h3>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📹 Video</span>
                                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📝 Amaliy</span>
                                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📖 Nazariy</span>
                                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">✍️ Uyga</span>
                                <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">📊 Test</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

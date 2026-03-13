import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, Table, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { reportService } from '../services/reportService';
import { cn } from '../lib/utils';
import { CustomCalendar } from './CustomCalendar';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{ thoughts: any[], deeds: any[], zenHistory: any[] } | null>(null);
  
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');

  if (!isOpen) return null;

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getReportData(startDate, endDate);
      setReportData(data);
      setStep('preview');
    } catch (error) {
      console.error("Failed to generate report data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      reportService.exportPDF(startDate, endDate);
    } else {
      reportService.exportCSV(startDate, endDate);
    }
  };

  const resetAndClose = () => {
    setStep('select');
    setReportData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 pb-4 shrink-0 border-b border-zen-accent/10">
            <h3 className="text-xl font-bold font-serif text-zen-ink flex items-center gap-2">
              {step === 'select' ? (
                <>
                  <FileText className="w-5 h-5 text-zen-accent" />
                  生成修行报告
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setStep('select')}
                    className="p-1 -ml-1 mr-1 text-zen-ink/40 hover:text-zen-accent rounded-full hover:bg-zen-bg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  报告预览
                </>
              )}
            </h3>
            <button onClick={resetAndClose} className="p-2 text-zen-ink/40 hover:text-zen-ink rounded-full hover:bg-zen-bg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {step === 'select' ? (
              <>
                {/* Date Range Selection */}
                <div>
                  <label className="block text-sm font-bold text-zen-ink mb-3">选择时间范围</label>
                  <div className="flex items-center gap-2 mb-4 bg-zen-bg/50 p-1 rounded-xl">
                    <button
                      onClick={() => setSelecting('start')}
                      className={cn(
                        "flex-1 py-2 px-3 text-sm rounded-lg transition-colors text-center",
                        selecting === 'start' ? "bg-white text-zen-accent shadow-sm font-bold" : "text-zen-ink/60 hover:text-zen-ink"
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">开始日期</div>
                      {startDate.toLocaleDateString()}
                    </button>
                    <div className="text-zen-accent/30">-</div>
                    <button
                      onClick={() => setSelecting('end')}
                      className={cn(
                        "flex-1 py-2 px-3 text-sm rounded-lg transition-colors text-center",
                        selecting === 'end' ? "bg-white text-zen-accent shadow-sm font-bold" : "text-zen-ink/60 hover:text-zen-ink"
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">结束日期</div>
                      {endDate.toLocaleDateString()}
                    </button>
                  </div>

                  <div className="border border-zen-accent/10 rounded-2xl overflow-hidden bg-white">
                    <CustomCalendar
                      selectedDate={selecting === 'start' ? startDate : endDate}
                      onSelectDate={(date) => {
                        if (selecting === 'start') {
                          setStartDate(date);
                          if (date > endDate) setEndDate(date);
                          setSelecting('end');
                        } else {
                          setEndDate(date);
                          if (date < startDate) setStartDate(date);
                        }
                      }}
                      recordDates={[]}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-zen-bg/50 rounded-2xl p-5 border border-zen-accent/10">
                  <div className="text-center mb-4">
                    <p className="text-xs font-bold text-zen-accent/60 uppercase tracking-wider mb-1">报告时间范围</p>
                    <p className="text-sm font-medium text-zen-ink">
                      {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-zen-accent/5 text-center shadow-sm">
                      <p className="text-2xl font-serif font-bold text-zen-accent mb-1">
                        {reportData?.thoughts.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-zen-ink/60">念头观察</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-zen-accent/5 text-center shadow-sm">
                      <p className="text-2xl font-serif font-bold text-[#556B2F] mb-1">
                        {reportData?.deeds.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-zen-ink/60">日行一善/忏悔</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-zen-accent/5 text-center shadow-sm">
                      <p className="text-2xl font-serif font-bold text-[#4682B4] mb-1">
                        {reportData?.zenHistory?.length || 0}
                      </p>
                      <p className="text-[10px] font-bold text-zen-ink/60">禅修/诵经</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-zen-ink">选择下载格式</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedFormat('pdf')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                        selectedFormat === 'pdf' 
                          ? "border-zen-accent bg-zen-accent/5 text-zen-accent" 
                          : "border-zen-accent/10 hover:border-zen-accent/30 hover:bg-zen-accent/5 text-zen-ink"
                      )}
                    >
                      <FileText className={cn("w-6 h-6", selectedFormat === 'pdf' ? "text-zen-accent" : "text-zen-accent/60 group-hover:text-zen-accent")} />
                      <span className="font-bold text-sm">PDF 报告</span>
                    </button>
                    <button
                      onClick={() => setSelectedFormat('csv')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                        selectedFormat === 'csv' 
                          ? "border-zen-accent bg-zen-accent/5 text-zen-accent" 
                          : "border-zen-accent/10 hover:border-zen-accent/30 hover:bg-zen-accent/5 text-zen-ink"
                      )}
                    >
                      <Table className={cn("w-6 h-6", selectedFormat === 'csv' ? "text-zen-accent" : "text-zen-accent/60 group-hover:text-zen-accent")} />
                      <span className="font-bold text-sm">CSV 数据</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-4 shrink-0 border-t border-zen-accent/10 bg-white">
            {step === 'select' ? (
              <button
                onClick={handleGeneratePreview}
                disabled={isLoading}
                className="w-full py-3.5 bg-zen-accent text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                生成预览
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3.5 bg-zen-bg text-zen-ink rounded-xl font-bold hover:bg-zen-accent/10 transition-colors flex items-center justify-center gap-2"
                >
                  返回修改
                </button>
                <button
                  onClick={() => handleDownload(selectedFormat)}
                  className="flex-[2] py-3.5 bg-zen-accent text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  下载 {selectedFormat.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

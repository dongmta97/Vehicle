import sys
import re

with open('src/components/DetailedSelectionProtocolForm.tsx', 'r', encoding='utf8') as f:
    content = f.read()

buttons = """          </fieldset>

          {/* Bottom Action Buttons (Hidden in print) */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-stone-200 print:hidden pb-8">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>In Biên Bản / Xuất PDF</span>
            </button>
            
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading || !activeVehicle?.vehicleId}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-all shadow-md"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isSaving ? "Đang lưu..." : "Lưu dữ liệu"}</span>
              </button>
            )}
          </div>
        </div>"""

# replace the last occurrence of </fieldset>\s*</div>
new_content = re.sub(r'</fieldset>\s*</div>', buttons, content, count=1)

with open('src/components/DetailedSelectionProtocolForm.tsx', 'w', encoding='utf8') as f:
    f.write(new_content)

print("Success")

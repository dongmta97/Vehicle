import os
import re

content = """
          {formData.updatedAt && (
            <div className="mt-12 text-center text-[12px] text-stone-400 italic print:hidden">
              Cập nhật lần cuối: {formData.updatedAt} {formData.updatedBy && `bởi ${formData.updatedBy}`}
            </div>
          )}
"""

pattern = re.compile(r'\{formData\.updatedAt && \(\s*<div[^>]*>\s*Cập nhật lần cuối:.*?</div>\s*\)\}', re.MULTILINE | re.DOTALL)
print(pattern.findall(content))

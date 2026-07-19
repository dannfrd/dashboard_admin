import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "window.confirm(" not in content:
        return
        
    print(f"Processing {filepath}")
    
    # 1. Add useConfirm to imports if not there
    if "useConfirm" not in content:
        content = re.sub(r'(} from "@/components/admin/ui";)', r'  useConfirm,\n\1', content)
        
    # 2. Add useConfirm hook inside the component
    if "const { confirm, ConfirmDialog } = useConfirm();" not in content:
        content = re.sub(r'(export default function [a-zA-Z0-9_]+\([^)]*\) \{)', r'\1\n  const { confirm, ConfirmDialog } = useConfirm();\n', content)
    
    # 3. Replace window.confirm
    # Pattern 1: if (!window.confirm("...")) return;
    def replace_confirm_inline(match):
        msg = match.group(1)
        return f'const ok = await confirm({msg});\n    if (!ok) return;'
    
    content = re.sub(r'if\s*\(!window\.confirm\((["\'].*?["\'])\)\)\s*return;', replace_confirm_inline, content)
    
    # Pattern 2: if (!window.confirm("...")) {
    def replace_confirm_block(match):
        msg = match.group(1)
        return f'const ok = await confirm({msg});\n    if (!ok) {{'
    
    content = re.sub(r'if\s*\(!window\.confirm\((["\'].*?["\'])\)\)\s*\{', replace_confirm_block, content)
    
    # 4. Insert <ConfirmDialog /> before </AdminPageShell>
    if "<ConfirmDialog />" not in content:
        content = content.replace("</AdminPageShell>", "  <ConfirmDialog />\n    </AdminPageShell>")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"c:\Kuliah Ardan\TA\Sistem\dashboard_admin\src\pages\admin"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            process_file(os.path.join(root, file))

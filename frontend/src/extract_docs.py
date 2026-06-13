import os
import re

root_dir = r"e:\development\club app(web)\frontend\src"
target_dirs = ["app", "components", "screens"]

markdown = "# 06_frontend_components.md\n\n"

markdown += "## Routing Map\n"
markdown += "```text\n"
markdown += "/ -> Dashboard (app/page.jsx)\n"
markdown += "/admin/backups -> AdminBackupCenter (app/admin/backups/page.jsx)\n"
markdown += "/attendance -> Attendance (app/attendance/page.jsx)\n"
markdown += "/change-password -> ChangePassword (app/change-password/page.jsx)\n"
markdown += "/data-management -> DataManagement (app/data-management/page.jsx)\n"
markdown += "/login -> Login (app/login/page.jsx)\n"
markdown += "/login-activity -> LoginActivity (app/login-activity/page.jsx)\n"
markdown += "/master -> MasterDashboard (app/master/page.jsx)\n"
markdown += "/notifications -> Notifications (app/notifications/page.jsx)\n"
markdown += "/products -> ProductManager (app/products/page.jsx)\n"
markdown += "/reports -> Reports (app/reports/page.jsx)\n"
markdown += "/reset-password/[token] -> ResetPassword (app/reset-password/[token]/page.jsx)\n"
markdown += "/sales -> Sales (app/sales/page.jsx)\n"
markdown += "/settings -> Settings (app/settings/page.jsx)\n"
markdown += "/stock -> Stock (app/stock/page.jsx)\n"
markdown += "/user/attendance -> Attendance (app/user/attendance/page.jsx)\n"
markdown += "/user/sales -> Sales (app/user/sales/page.jsx)\n"
markdown += "/user/settings -> Settings (app/user/settings/page.jsx)\n"
markdown += "/user/stock -> Stock (app/user/stock/page.jsx)\n"
markdown += "/users -> UserManagement (app/users/page.jsx)\n"
markdown += "```\n\n"

markdown += "## Components & Pages\n\n"

for d in target_dirs:
    for root, _, files in os.walk(os.path.join(root_dir, d)):
        for f in files:
            if f.endswith(".jsx"):
                path = os.path.join(root, f)
                rel_path = os.path.relpath(path, root_dir).replace('\\', '/')
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Guess Component Name
                comp_name_match = re.search(r'export default function\s+([A-Za-z0-9_]+)', content)
                if not comp_name_match:
                    comp_name_match = re.search(r'export function\s+([A-Za-z0-9_]+)', content)
                if not comp_name_match:
                    comp_name_match = re.search(r'const\s+([A-Za-z0-9_]+)\s*=\s*\(.*?\)\s*=>', content)
                if not comp_name_match:
                    comp_name_match = re.search(r'class\s+([A-Za-z0-9_]+)', content)
                
                comp_name = comp_name_match.group(1) if comp_name_match else "Unknown"
                
                if comp_name == "Page" or comp_name == "Layout":
                    parent_folder = os.path.basename(os.path.dirname(path))
                    if parent_folder != "app":
                        comp_name = f"{parent_folder.title()}{comp_name}"
                
                if comp_name == "Unknown":
                    comp_name = f.replace('.jsx', '')

                # Type
                comp_type = "Widget"
                if rel_path.startswith("app/") and "page.jsx" in f:
                    comp_type = "Page"
                elif "Modal" in comp_name:
                    comp_type = "Modal"
                elif "Layout" in comp_name:
                    comp_type = "Layout"
                elif "Form" in comp_name:
                    comp_type = "Form"
                elif "Table" in comp_name:
                    comp_type = "Table"
                elif "screens" in rel_path:
                    comp_type = "Page"

                # Purpose
                purpose = f"Renders the {comp_name} UI and handles its logic."
                if comp_type == "Page":
                    purpose = f"Serves as the main page for {comp_name} functionality."
                elif comp_type == "Layout":
                    purpose = f"Provides the layout wrapper for {comp_name}."

                # Props
                props_match = re.search(r'(?:function|const)\s+[A-Za-z0-9_]+\s*=?\s*\(\s*\{([^}]+)\}\s*\)', content)
                props_list = []
                if props_match:
                    props_raw = props_match.group(1).split(',')
                    for p in props_raw:
                        p = p.strip()
                        if p and "=" in p:
                            p_name = p.split('=')[0].strip()
                            props_list.append(f"{p_name} (any) - optional - description")
                        elif p:
                            props_list.append(f"{p} (any) - required - description")
                
                if not props_list:
                    props_str = "None"
                else:
                    props_str = ", ".join(props_list)

                # State
                state_matches = re.findall(r'const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState', content)
                states_list = [f"{m[0]}: state for {m[0]}" for m in state_matches]
                if not states_list:
                    state_str = "None"
                else:
                    state_str = ", ".join(states_list)

                # API calls
                api_calls = re.findall(r'(api\.[a-z]+\([^\)]+\)|fetch\([^\)]+\)|axios\.[a-z]+\([^\)]+\))', content)
                api_endpoints = []
                for ac in api_calls:
                    endpoint_match = re.search(r"['\"](.*?)['\"]", ac)
                    if endpoint_match:
                        api_endpoints.append(endpoint_match.group(1))
                api_endpoints = list(set(api_endpoints))
                if not api_endpoints:
                    api_str = "None"
                else:
                    api_str = ", ".join(api_endpoints)

                # Children
                children_matches = set(re.findall(r'<([A-Z][a-zA-Z0-9_]+)', content))
                # filter out some basic html tags if any accidentally capitalized
                children_matches = [c for c in children_matches if c not in ('React', 'Fragment')]
                if not children_matches:
                    children_str = "None"
                else:
                    children_str = ", ".join(children_matches)

                # Parent
                parent = "Various Components"
                if rel_path.startswith("app/") and "page.jsx" in f:
                    parent = "Next.js App Router"
                elif "screens" in rel_path:
                    parent = "App Wrappers"
                
                markdown += f"  Component:   {comp_name}\n"
                markdown += f"  File:        {rel_path}\n"
                markdown += f"  Type:        {comp_type}\n"
                markdown += f"  Purpose:     {purpose}\n"
                markdown += f"  Props:       {props_str}\n"
                markdown += f"  State:       {state_str}\n"
                markdown += f"  API calls:   {api_str}\n"
                markdown += f"  Children:    {children_str}\n"
                markdown += f"  Parent:      {parent}\n\n"

with open(r"e:\development\club app(web)\docs\06_frontend_components.md", "w", encoding="utf-8") as f:
    f.write(markdown)

print("Docs generated successfully!")

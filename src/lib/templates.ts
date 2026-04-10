export interface BotTemplate {
    id: string;
    name: string;
    description: string;
    language: "python" | "php";
    files: { path: string; content: string }[];
}

export const BOT_TEMPLATES: BotTemplate[] = [
    {
        id: "python-simple",
        name: "بوت بايثون بسيط",
        description: "قالب أساسي لبدء تطوير بوت بايثون",
        language: "python",
        files: [
            {
                path: "main.py",
                content: `import os\nprint("Hello World from Wolf Hosting!")\nprint(f"Server Port: {os.environ.get('PORT')}")`
            }
        ]
    },
    {
        id: "php-simple",
        name: "سكربت PHP بسيط",
        description: "قالب أساسي لموقع PHP بسيط",
        language: "php",
        files: [
            {
                path: "index.php",
                content: `<?php\necho "<h1>أهلاً بك في استضافة الذئب</h1>";\necho "<p>المنفذ الحالي: " . getenv('PORT') . "</p>";`
            }
        ]
    }
];

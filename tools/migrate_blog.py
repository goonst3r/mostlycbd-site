import os

def migrate_blog_files():
    blog_dir = 'blog'
    if not os.path.exists(blog_dir):
        print(f"Directory '{blog_dir}' not found. Ensure you are in the project root.")
        return

    blog_files = [f for f in os.listdir(blog_dir) if f.endswith('.html')]
    
    for filename in blog_files:
        old_path = os.path.join(blog_dir, filename)
        new_filename = f"blog-{filename}"
        new_path = new_filename # writes to root directory
        
        with open(old_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Update relative asset/page links (since we are moving up a level)
        content = content.replace('href="../', 'href="')
        content = content.replace('src="../', 'src="')
        content = content.replace("url('../", "url('")
        
        # 2. Update intra-blog links (e.g., href="ecs-system.html" -> href="blog-ecs-system.html")
        for bf in blog_files:
            content = content.replace(f'href="{bf}"', f'href="blog-{bf}"')
            
        # 3. Update Open Graph URLs
        content = content.replace('https://mostlycbd.com/blog/', 'https://mostlycbd.com/blog-')
        
        with open(new_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Moved and updated: {old_path} -> {new_path}")
        os.remove(old_path)

    # 4. Move style-blog.css if it exists
    css_file = os.path.join(blog_dir, 'style-blog.css')
    if os.path.exists(css_file):
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read().replace("url('../", "url('")
        with open('style-blog.css', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Moved and updated: style-blog.css")
        os.remove(css_file)

    # 5. Attempt to safely remove the blog directory if it is now empty
    try:
        os.rmdir(blog_dir)
    except OSError:
        pass

    # 6. Update references in existing root HTML files (like index.html, blog.html)
    root_html_files = [f for f in os.listdir('.') if f.endswith('.html') and not f.startswith('blog-')]
    for rh in root_html_files:
        with open(rh, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for bf in blog_files:
            content = content.replace(f'href="blog/{bf}"', f'href="blog-{bf}"')
            
        if original_content != content:
            with open(rh, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated links in root file: {rh}")

if __name__ == '__main__':
    migrate_blog_files()
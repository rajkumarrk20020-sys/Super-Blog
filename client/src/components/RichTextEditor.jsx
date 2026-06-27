import React, { useState } from 'react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertTag = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('blogContentTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    if (tagClose) {
      replacement = tagOpen + selected + tagClose;
    } else {
      replacement = tagOpen;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    // Reset focus and cursor placement
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 50);
  };

  return (
    <div className="card border-1 shadow-sm rounded-3 overflow-hidden">
      <div className="card-header bg-light border-bottom d-flex align-items-center justify-content-between py-2 px-3">
        <div className="d-flex align-items-center gap-1 flex-wrap">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Bold"
            onClick={() => insertTag('<strong>', '</strong>')}
            disabled={isPreview}
          >
            <i className="bi bi-type-bold fw-bold"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Italic"
            onClick={() => insertTag('<em>', '</em>')}
            disabled={isPreview}
          >
            <i className="bi bi-type-italic"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Heading 1"
            onClick={() => insertTag('<h1>', '</h1>')}
            disabled={isPreview}
          >
            <i className="bi bi-type-h1"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Heading 2"
            onClick={() => insertTag('<h2>', '</h2>')}
            disabled={isPreview}
          >
            <i className="bi bi-type-h2"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Unordered List"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            disabled={isPreview}
          >
            <i className="bi bi-list-ul"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Ordered List"
            onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
            disabled={isPreview}
          >
            <i className="bi bi-list-ol"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Blockquote"
            onClick={() => insertTag('<blockquote>', '</blockquote>')}
            disabled={isPreview}
          >
            <i className="bi bi-quote"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0"
            title="Paragraph"
            onClick={() => insertTag('<p>', '</p>')}
            disabled={isPreview}
          >
            <i className="bi bi-paragraph"></i>
          </button>
        </div>
        <div>
          <button
            type="button"
            className={`btn btn-sm ${isPreview ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? 'Write HTML' : 'Live Preview'}
          </button>
        </div>
      </div>
      <div className="card-body p-0">
        {isPreview ? (
          <div
            className="p-4 bg-white overflow-auto blog-preview-pane"
            style={{ minHeight: '300px', maxHeight: '500px' }}
            dangerouslySetInnerHTML={{ __html: value || '<p className="text-muted">No content to preview yet.</p>' }}
          ></div>
        ) : (
          <textarea
            id="blogContentTextarea"
            className="form-control border-0 p-4 rounded-0"
            style={{ minHeight: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '14px' }}
            placeholder={placeholder || 'Write your blog post in HTML format... You can use the buttons above to format.'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;

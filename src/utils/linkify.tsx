import React from 'react';

/**
 * URLパターンのマッチング
 */
export const URL_REGEX = /https?:\/\/[^\s<>"`{}|\\^[\]]*[^\s<>"`{}|\\^[\].,;:!?()]/gi;

/**
 * URLをハイパーリンクに変換する
 * @param text テキスト
 * @returns JSX要素の配列（テキストとリンク要素の混合）
 */
export const linkifyText = (text: string) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // URLをリンク要素として追加
    const url = match[0];
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#1976D2',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        {url}
      </a>
    );

    lastIndex = URL_REGEX.lastIndex;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // テキストのみの場合はそのまま返す
  return parts.length === 0 ? text : parts;
};

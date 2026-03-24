import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity } from 'react-native';

// Markup types from API contract
interface Markup {
  start: number;
  end: number;
  type: string; // "bold" | "italic" | "STRONG" | "link" | "code" | "highlight"
  href?: string;
}

interface ParagraphMetadata {
  src?: string;
  alt?: string;
  caption?: string;
  language?: string;
  href?: string;
}

interface Paragraph {
  id: string;
  type: string; // "P" | "H1" | "H2" | "BQ1" | "BQ2" | "PRE" | "IMG" | "VID" | "link" | "HR" | "OLI" | "ULI"
  text?: string;
  markups?: Markup[];
  metadata?: ParagraphMetadata;
}

interface BodyModelRendererProps {
  paragraphs: Paragraph[];
}

// Apply markups to text, returning an array of styled Text components
const renderTextWithMarkups = (text: string, markups: Markup[] = []) => {
  if (!text) return null;
  if (!markups || markups.length === 0) return <Text>{text}</Text>;

  // Sort markups by start position
  const sorted = [...markups].sort((a, b) => a.start - b.start);

  const elements: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((markup, i) => {
    const start = Math.max(markup.start, 0);
    const end = Math.min(markup.end, text.length);

    // Add plain text before this markup
    if (cursor < start) {
      elements.push(<Text key={`plain-${i}`}>{text.slice(cursor, start)}</Text>);
    }

    const markedText = text.slice(start, end);
    const style = getMarkupStyle(markup.type);

    if (markup.type === 'link' && markup.href) {
      elements.push(
        <Text
          key={`markup-${i}`}
          style={[style, styles.link]}
          onPress={() => Linking.openURL(markup.href!)}
        >
          {markedText}
        </Text>
      );
    } else {
      elements.push(
        <Text key={`markup-${i}`} style={style}>
          {markedText}
        </Text>
      );
    }

    cursor = end;
  });

  // Remaining text after last markup
  if (cursor < text.length) {
    elements.push(<Text key="plain-end">{text.slice(cursor)}</Text>);
  }

  return elements;
};

const getMarkupStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'bold':
    case 'strong':
      return styles.bold;
    case 'italic':
    case 'em':
      return styles.italic;
    case 'highlight':
      return styles.highlight;
    case 'code':
      return styles.inlineCode;
    default:
      return {};
  }
};

const BodyModelRenderer: React.FC<BodyModelRendererProps> = ({ paragraphs }) => {
  if (!paragraphs || paragraphs.length === 0) {
    return <Text style={styles.paragraph}>No content</Text>;
  }

  return (
    <View>
      {paragraphs.map((para, index) => {
        switch (para.type) {
          case 'H1':
            return (
              <Text key={para.id || index} style={styles.h1}>
                {renderTextWithMarkups(para.text || '', para.markups)}
              </Text>
            );
          case 'H2':
            return (
              <Text key={para.id || index} style={styles.h2}>
                {renderTextWithMarkups(para.text || '', para.markups)}
              </Text>
            );
          case 'P':
            return (
              <Text key={para.id || index} style={styles.paragraph}>
                {renderTextWithMarkups(para.text || '', para.markups)}
              </Text>
            );
          case 'BQ1':
          case 'BQ2':
            return (
              <View key={para.id || index} style={styles.blockquote}>
                <Text style={styles.blockquoteText}>
                  {renderTextWithMarkups(para.text || '', para.markups)}
                </Text>
              </View>
            );
          case 'PRE':
            return (
              <View key={para.id || index} style={styles.codeBlock}>
                {para.metadata?.language && (
                  <Text style={styles.codeLanguage}>{para.metadata.language}</Text>
                )}
                <Text style={styles.codeText}>{para.text || ''}</Text>
              </View>
            );
          case 'IMG':
            return (
              <View key={para.id || index} style={styles.imageContainer}>
                {para.metadata?.src && (
                  <Image
                    source={{ uri: para.metadata.src }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
                {para.metadata?.caption && (
                  <Text style={styles.caption}>{para.metadata.caption}</Text>
                )}
              </View>
            );
          case 'HR':
            return <View key={para.id || index} style={styles.hr} />;
          case 'OLI':
            return (
              <View key={para.id || index} style={styles.listItem}>
                <Text style={styles.listBullet}>{index + 1}.</Text>
                <Text style={styles.listText}>
                  {renderTextWithMarkups(para.text || '', para.markups)}
                </Text>
              </View>
            );
          case 'ULI':
            return (
              <View key={para.id || index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>
                  {renderTextWithMarkups(para.text || '', para.markups)}
                </Text>
              </View>
            );
          case 'link':
            return (
              <TouchableOpacity
                key={para.id || index}
                onPress={() => para.metadata?.href && Linking.openURL(para.metadata.href)}
                style={styles.linkBlock}
              >
                <Text style={styles.linkBlockText}>
                  {para.text || para.metadata?.href || 'Link'}
                </Text>
              </TouchableOpacity>
            );
          default:
            // Fallback: render as paragraph
            return (
              <Text key={para.id || index} style={styles.paragraph}>
                {renderTextWithMarkups(para.text || '', para.markups)}
              </Text>
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Typography
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#292929',
    lineHeight: 36,
    marginBottom: 16,
    marginTop: 24,
    fontFamily: 'Inter_700Bold',
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#292929',
    lineHeight: 30,
    marginBottom: 12,
    marginTop: 20,
    fontFamily: 'Inter_700Bold',
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 30,
    color: '#292929',
    marginBottom: 16,
    fontFamily: 'Merriweather_400Regular',
  },

  // Markups
  bold: {
    fontWeight: '700',
    fontFamily: 'Merriweather_700Bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  highlight: {
    backgroundColor: '#FFFDE7',
    color: '#292929',
  },
  inlineCode: {
    backgroundColor: '#F5F5F5',
    fontFamily: 'monospace',
    fontSize: 16,
    paddingHorizontal: 4,
    borderRadius: 3,
    color: '#E74C3C',
  },
  link: {
    color: '#1A8917',
    textDecorationLine: 'underline' as const,
  },

  // Blockquote
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#292929',
    paddingLeft: 20,
    marginVertical: 16,
    marginLeft: 4,
  },
  blockquoteText: {
    fontSize: 18,
    lineHeight: 30,
    color: '#757575',
    fontStyle: 'italic',
    fontFamily: 'Merriweather_400Regular',
  },

  // Code block
  codeBlock: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  codeLanguage: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 8,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#E0E0E0',
    fontFamily: 'monospace',
  },

  // Image
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 4,
  },
  caption: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },

  // HR
  hr: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },

  // List
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  listBullet: {
    fontSize: 18,
    color: '#292929',
    marginRight: 12,
    lineHeight: 30,
    fontFamily: 'Merriweather_400Regular',
  },
  listText: {
    fontSize: 18,
    lineHeight: 30,
    color: '#292929',
    flex: 1,
    fontFamily: 'Merriweather_400Regular',
  },

  // Link block
  linkBlock: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#1A8917',
  },
  linkBlockText: {
    fontSize: 16,
    color: '#1A8917',
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'underline' as const,
  },
});

export default BodyModelRenderer;

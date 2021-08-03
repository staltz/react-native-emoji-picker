import {PureComponent, createElement as $} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
const emoji = require('emoji-datasource');
const groupBy = require('lodash.groupby');
const orderBy = require('lodash.orderby');
const mapValues = require('lodash.mapvalues');

// Polyfill for Android
require('string.fromcodepoint');

// Conversion of codepoints and surrogate pairs. See more here:
// https://mathiasbynens.be/notes/javascript-unicode
// https://mathiasbynens.be/notes/javascript-escapes#unicode-code-point
// and `String.fromCodePoint` on MDN
function charFromUtf16(utf16: string) {
  return String.fromCodePoint(...(utf16.split('-').map(u => '0x' + u) as any));
}

function charFromEmojiObj(obj: any) {
  return charFromUtf16(obj.unified);
}

const blocklistedEmojis = ['white_frowning_face', 'keycap_star', 'eject'];

const filteredEmojis = emoji.filter((e: any) => {
  if (blocklistedEmojis.includes(e.short_name)) return false;
  if (Platform.OS === 'android') {
    if (e.added_in === '2.0') return true;
    if (e.added_in === '4.0') return Platform.Version >= 24;
    if (e.added_in === '5.0') return Platform.Version >= 26;
    if (e.added_in === '11.0') return Platform.Version >= 28;
    else return Platform.Version >= 29;
  } else {
    return true;
  }
});

// sort emojis by 'sort_order' then group them into categories
const groupedAndSorted = groupBy(
  orderBy(filteredEmojis, 'sort_order'),
  'category',
);

// convert the emoji object to a character
const emojisByCategory = mapValues(groupedAndSorted, (group: any) =>
  group.map(charFromEmojiObj),
);

type LocalizedCategories = [
  string, // Smileys & Emotion
  string, // People & Body
  string, // Animals & Nature
  string, // Food & Drink
  string, // Activities
  string, // Travel & Places
  string, // Objects
  string, // Symbols
  // string, // Flags
];

const CATEGORIES: LocalizedCategories = [
  'Smileys & Emotion',
  'People & Body',
  'Animals & Nature',
  'Food & Drink',
  'Activities',
  'Travel & Places',
  'Objects',
  'Symbols',
  // 'Flags',
  // TODO: Flags category has too many missing emojis in various configurations
  // of Android versions, and the data in emoji-datasource is not accurate
  // enough to filter them properly, so we're postponing the support for Flag
  // as reactions.
];

const DEFAULT_EMOJI_SIZE = 24;
const PADDING = 5;

const styles = StyleSheet.create({
  screen: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  background: {
    backgroundColor: '#00000077',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },

  container: {
    backgroundColor: 'white',
    padding: PADDING,
  },

  headerText: {
    padding: PADDING,
    color: 'black',
    justifyContent: 'center',
    textAlignVertical: 'center',
  },

  categoryOuter: {},

  categoryInner: {
    flexWrap: 'wrap',
    flexDirection: 'column',
    marginRight: PADDING * 2,
  },

  clearButton: {
    padding: 15,
    textAlign: 'center',
    color: 'black',
    textAlignVertical: 'center',
  },
});

class ClearButton extends PureComponent<{
  onEmojiSelected: (e: string | null) => void;
  clearButtonStyle?: ViewStyle;
  clearButtonText?: string;
}> {
  public render() {
    return $(
      TouchableOpacity,
      {onPress: () => this.props.onEmojiSelected(null)},
      $(
        Text,
        {style: [styles.clearButton, this.props.clearButtonStyle]},
        this.props.clearButtonText ?? 'Clear',
      ),
    );
  }
}

class EmojiCategory extends PureComponent<{
  category: string;
  onEmojiSelected: (e: string) => void;
  emojiSize?: number;
  emojiStyle?: ViewStyle;
  rows?: number;
  headerStyle?: TextStyle;
  localizedCategories?: LocalizedCategories;
}> {
  public render() {
    const emojis = emojisByCategory[this.props.category];
    const size = this.props.emojiSize || DEFAULT_EMOJI_SIZE;
    const style = {
      fontSize: size,
      textAlign: 'center' as const,
      lineHeight: size + PADDING * 2,
      paddingHorizontal: PADDING,
    };
    const rows = this.props.rows ?? 7;
    const maxHeight = (size + PADDING * 2) * rows + PADDING;
    const categoryText = this.props.localizedCategories
      ? this.props.localizedCategories[CATEGORIES.indexOf(this.props.category)]
      : this.props.category;

    return $(
      View,
      {style: styles.categoryOuter},
      $(
        Text,
        {style: [styles.headerText, this.props.headerStyle]},
        categoryText,
      ),
      $(
        View,
        {style: [styles.categoryInner, {maxHeight}]},
        ...emojis.map((e: string) =>
          $(
            Text,
            {
              style: [style, this.props.emojiStyle],
              key: e,
              onPress: () => this.props.onEmojiSelected(e),
            },
            e,
          ),
        ),
      ),
    );
  }
}

export default class EmojiPicker extends PureComponent<{
  onEmojiSelected: (e: string | null) => void;
  onPressOutside?: () => void;
  rows?: number;
  localizedCategories?: LocalizedCategories;
  hideClearButton?: boolean;
  emojiSize?: number;
  emojiStyle?: ViewStyle;
  modalStyle?: ViewStyle;
  backgroundStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  scrollStyle?: ViewStyle;
  headerStyle?: TextStyle;
  clearButtonStyle?: ViewStyle;
  clearButtonText?: string;
}> {
  private renderCategory = ({item}: any) => {
    const category = item;
    return $(EmojiCategory, {...this.props, key: category, category});
  };

  public render() {
    return $(
      View,
      {style: [styles.screen, this.props.modalStyle]},
      $(
        View,
        {style: [styles.container, this.props.containerStyle]},
        $(FlatList, {
          data: CATEGORIES,
          horizontal: true,
          style: this.props.scrollStyle,
          initialNumToRender: 1,
          maxToRenderPerBatch: 1,
          keyExtractor: category => category as string,
          renderItem: this.renderCategory,
        }),
        this.props.hideClearButton ? null : $(ClearButton, this.props),
      ),

      $(
        TouchableWithoutFeedback,
        {
          onPress: () => {
            this.props.onPressOutside?.();
          },
        },
        $(View, {style: [styles.background, this.props.backgroundStyle]}),
      ),
    );
  }
}

## Emoji picker for React Native

**Forked from [yonahforst/react-native-emoji-picker](https://github.com/yonahforst/react-native-emoji-picker)**

The changes made from react-native-emoji-picker to **react-native-emoji-picker-staltz** are:

- Supports `rows: number` prop to specify number of rows used in the layout
- Supports **only** the modal-looking overlay
- Supports `onPressOutside` prop
- Supports customizing the names of the categories, with the prop `localizedCategories`
- Supports several styling props:
  - `modalStyle`
  - `backgroundStyle`
  - `containerStyle`
  - `scrollStyle`
  - `headerStyle`
  - `clearButtonStyle`
- Implemented with FlatList, not a ScrollView with `setTimeout` hacks (this caused bugs with touchables)
- Implemented in TypeScript (so that a `.d.ts` file is provided)
- Calculates Android support (of each emoji) differently, based on the Android OS version and the "added_in" property of an Emoji
- Does not depend on the entire Lodash, depends on just 3 specific Lodash utils
- Does not depend on `prop-types`

## Installation

```
npm install --save react-native-emoji-picker-staltz
```

## Usage

This component is designed to be the **only child** of a `<Modal>` component, in full screen.

```jsx
import EmojiPicker from 'react-native-emoji-picker-staltz';

class Main extends React.Component {
  _emojiSelected(emoji) {
    console.log(emoji)
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal visible={true} transparent={true}>
          <EmojiPicker
            onEmojiSelected={this._emojiSelected}
            rows={7}
            localizedCategories={[ // Always in this order:
              'Smileys and emotion',
              'People and body',
              'Animals and nature',
              'Food and drink',
              'Activities',
              'Travel and places',
              'Objects',
              'Symbols',
            ]}
            />
        </Modal>
      </View>
    );
  }
}
```

Props:

```typescript
type Props = {
  onEmojiSelected: (e: string | null) => void;
  onPressOutside?: () => void;
  rows?: number;
  localizedCategories?: Array<string>;
  hideClearButton?: boolean;
  emojiSize?: number;
  modalStyle?: ViewStyle;
  backgroundStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  scrollStyle?: ViewStyle;
  headerStyle?: TextStyle;
  clearButtonStyle?: ViewStyle;
  clearButtonText?: string;
}
```

## License

Copyright (c) 2016 Yonah Forst
Modifications: Copyright (c) 2020 Andre 'Staltz' Medeiros

MIT

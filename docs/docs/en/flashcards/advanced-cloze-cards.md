# Advanced Cloze Cards

!!! warning "Under Construction"
    This section needs further work. Let's consider completing this separately to other aspects of https://github.com/st3v3nmw/obsidian-spaced-repetition/pull/943

    I think the name "Generalised Cloze Overlapping" is good for people already familiar with the term "cloze overlapping". 
    
    For new people I think it could be difficult. Are you happy with the term "Deletion Visibility" below? Perhaps "Generalised Deletion Visibility" for the feature name?

    Or perhaps "Cloze Visibility" instead of "Deletion Visibility" and for the feature name:<br/>
    :material-circle-medium: "Generalised Cloze Visibility" or <br/>
    :material-circle-medium: "Flexible Cloze Visibility" or <br/>
    :material-circle-medium: "Advanced Cloze Visibility"?

## Generalized Cloze Overlapping

When there are multiple cloze deletions in a [Basic Cloze Card](basic-cloze-cards.md), then multiple cards will be shown for review, each one occluding one deletion, while leaving the other deletions visible.

### Limitations of Basic Cloze Cards

Sometimes when there are multiple cloze deletions in a single card, the deletions shown during a review of a specific card
make it too easy to recall the text that is hidden.

[Deletion Groups](basic-cloze-cards.md) allow some flexibility so that this doesn't occur.

If that mechanism doesn't provide sufficient flexibility, `Generalized Cloze Overlapping` enables complete tailoring.

### Deletion Visibility

`Generalized Cloze Overlapping` allows you to dictate the behavior of each deletion individually. Each deletion has a `Visibility` that indicates how it will behave on each card:

!!! note "Terminology: Overlapping"
    The term `overlapping` is based on an Anki plugin [Cloze Overlapper](https://ankiweb.net/shared/info/969733775)

Deletion Visibility | Code | Shown on front | Shown on back
------------ | ------------- | ------------ | ------------
ask | a | No | Yes
hide | h | No | No
show | s | Yes | Yes

!!! note  "Multiline cards with a blank line"
    Blank lines signify the end of a card. The solitary `.` on the second line is a workaround
    so that the lines after it are still considered part of the card.
    
For instance, the following note:

```
==Some context for items 2 and 4, but that could spoil items 1 and 3. Note that this doesn't even need to be asked==[^hshs]
.
- ==Item 1==[^ashh]
- ==Item 2==[^hash]
- ==Item 3==[^hhas]
- ==Item 4==[^hhha]
```

In this example, 4 cards will be generated, where items 1 to 4 will be asked sequentially. When asking Item 1, all other text will be hidden. When asking Item 2, just the Item 1 and the context will be displayed. When asking Item 3, only the Item 2 will be displayed. Finally, when asking Item 4, both the Item 3 and the context text will be displayed.


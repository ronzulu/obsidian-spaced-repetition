# Custom Cloze Syntax

!!! Question "Question For Ocimar"
    I thought that "custom cloze syntax" might be preferable over "custom cloze patterns"

!!! warning "Under Construction"

You can now create your own Cloze Patterns. For instance, to emulate Anki-like clozes (e.g., `{{1::this is the deletion text::the hint}}`), simply add the following pattern to your settings:

`{{[123::]answer[::hint]}}`

Brackets [] delineate where the sequence number and hint will be placed, along with any additional characters of your choice (e.g., the :: in the example above). Clozecraft automatically generates a regex pattern based on your custom pattern. Sequence numbers are identified by finding numbers between brackets, hints by finding the word hint in brackets, and the deleted text by finding the word answer.

Here are some examples of custom patterns:
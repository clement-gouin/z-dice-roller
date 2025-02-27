# Dice Roller
*When rolling decides your fate*

### [Tool link](https://clement-gouin.github.io/dice-roller/)

## Data format

Format is made line by line

Header (5-6 lines):
```txt
1   Roll name (html, <h1> on plain text)
2   Correct answer (html, <h2> on plain text)
3   Incorrect answer (html, <h2> on plain text)
4   Dices to roll (as XdY)
5   Minimum score to obtain (0+)
6   Saved roll expiration in minutes (0+, default to 1 day)
7   Already rolled text (html, optional, <h2> on plain text)
```

## Samples

```txt
Gambling time
<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>
You fail !
2d6
6
```

```txt
Try to make a double six
You did it !
Try again in a minute !
2d6
12
1
```


## Tips

* [Material design colors](https://materialui.co/colors/) are available, you can use `class="red-500"` on your HTML
* [Lucide icons](https://lucide.dev/icons) are available, you can use `<i icon="house"></i>` on your HTML
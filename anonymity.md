# Anonymity on [Mapknitter](https://mapknitter.org)

[Publiclab](https://publiclab.org) is an organization dedicated to protecting the planet by building useful [tools](https://github.com/publiclab) and bringing together passionate and kind people who want to have a positive impact. Mapknitter was at the beginning of this collaboration between committed individuals when it was used to [provide public information about the 2010 BP Oil Disaster](https://publiclab.org/wiki/stories). It has since grown and now hosts **2761** maps yet it still upholds its fundamental idea of sharing **open** data that anyone can **contribute to or edit**. This mission is why the ability to contribute anonymously is important for this project. 

Users **should not** be bogged down with privacy issues and the extra barrier of creating an account as they advance this initiative but fighting the [problems of anonymous contributions](https://github.com/publiclab/mapknitter/issues/1029) is also important.

## Privacy and Impact
 Supporting **user privacy** is crucial to Mapknitter and its contributors because of this information explained by @jywarren:

> We have had input from community partners that people who may be  vulnerable or are concerned about being connected to data produced on  MapKnitter.org may be more comfortable producing maps anonymously,  despite the drawbacks. 

Indeed, users of our open source software have explained that keeping their data private is a major concern for them and might even help ensure their security. 

They would not want to be identified and need anonymity to preserve this. Implementing and perfecting this feature lets us aid these users as they exert their freedom of expression in a way that is safe for them. Although it can be difficult to comprehend the importance of anonymity for these people, the mere fact that this is a concern justifies our attempts to accommodate and assist them.

You can learn read a short overview of this issue relative to Mapknitter [here](https://github.com/publiclab/mapknitter/issues/1021#issuecomment-565624601) or you can read this more general but extremely relevant article about [anonymity and freedom of expression](https://www.eff.org/files/filenode/unspecialrapporteurfoe2011-final_3.pdf).

---

## User Interface Problems and Deterrence

[Login walls](https://www.nngroup.com/articles/login-walls/) can very easily deter users from accessing Mapknitter tools and creating maps. We want to ensure that any user can have an easy and direct access to the platform. An important part of our decision to allow anonymity is to make sure users are not put off by a pushy user interface that forces them to create an account for our **nonprofit** website.

---

## Technical Aspects

Currently. we allow anonymous users but they are limited in certain aspects as they cannot:

- Post comments on the maps and be part of the discussion.
- Export featured maps.
- Delete images - because for anonymous users we can't tell whose images they are or who should be allowed to delete  them

This allows us to preserve anonymity while preventing vandalism or degradation of content quality although it does not fully counter [spammy behavior](https://github.com/publiclab/mapknitter/issues/246). 

Some potential features that could help fix this are:

- [Edit history for maps and images](https://github.com/publiclab/mapknitter/issues/463#issuecomment-478184881) - Registered users could then **revert** changes made by anonymous ones if they are not useful.

- [Edit permissions](https://github.com/publiclab/mapknitter/issues/84#issuecomment-510123139) - Registered users can restrict whether anyone can edit their map **or not**.

- [Review before maps are posted](https://github.com/publiclab/mapknitter/issues/1029) - This would make submissions from anonymous or first time posters require moderation before being approved and public.


# Anonymity on [Mapknitter](https://mapknitter.org)

[Publiclab](https://publiclab.org) is an organization dedicated to protecting the planet by building useful [tools](https://github.com/publiclab) and bringing together passionate and kind people who want to have a positive impact. Mapknitter was at the beginning of this collaboration between committed individuals when it was used to [provide public information about the 2010 BP Oil Disaster](https://publiclab.org/wiki/stories). It has since grown and now hosts **2761** maps yet it still upholds its fundamental idea of sharing **open** data that anyone can **contribute to or edit**. This mission is why the ability to contribute anonymously is important for this project. 

Users **should not** be bogged down with privacy issues and the extra barrier of creating an account as they advance this initiative but there are also [problems created by this functionality](https://github.com/publiclab/mapknitter/issues/1029)

## Privacy and Impact
Section about why users might need to contribute anonymously and how we can allow these people to help.

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

---

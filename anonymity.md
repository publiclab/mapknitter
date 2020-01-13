# Anonymity on [MapKnitter](https://mapknitter.org)

[Public Lab](https://publiclab.org) is an organization dedicated to protecting the planet by building useful [tools](https://github.com/publiclab) and bringing together passionate and kind people who want to have a positive impact. MapKnitter was at the beginning of this collaboration between committed individuals when it was used to [provide public information about the 2010 BP Oil Disaster](https://publiclab.org/wiki/stories). It has since grown and now hosts more than **2761** maps, yet it still upholds its fundamental idea of sharing **open** data that anyone can **contribute to or edit**.  

Users **should not** be bogged down with privacy issues and the extra barrier of creating an account as they advance this initiative but fighting the [problems of anonymous contributions](https://github.com/publiclab/mapknitter/issues/1029) is also important.

## Privacy and Impact

 Supporting **user privacy** is crucial to MapKnitter and its contributors as explained by [@jywarren](https://github.com/jywarren):

> Publiclab has had input from community partners that people who may be vulnerable or are concerned about being connected to data produced on mapknitter.org may be more comfortable producing maps anonymously, despite the drawbacks. 
> Indeed, users of our open source software have explained that keeping their data private is a major concern for them and might even help ensure their security.

Certain users do not want to be identified and need anonymity to preserve this. Implementing and perfecting this feature lets us aid these users as they exert their freedom of expression in a way that is safe for them.

You can read this more general but extremely relevant article on the important issue of [anonymity and freedom of expression](https://www.eff.org/files/filenode/unspecialrapporteurfoe2011-final_3.pdf) to better understand the roots of this issue.

---

## User Interface Problems and Deterrence

[Login walls](https://www.nngroup.com/articles/login-walls/) can very easily deter users from accessing MapKnitter tools and creating maps. We want to ensure that any user can have an easy and direct access to the platform.

As you can see below, we've opted for a compromise that warns users that they will have access to more functionality if they log in **but** if they prefer to stay anonymous this is also possible.

We would love to let anonymous users uses these features but unfortunately it would be impossible to supervise these users if we allowed them to change and sometimes diminish the content of registered users.

![mapknitter](https://raw.githubusercontent.com/Uzay-G/mapknitter/main/mapknitter-anon.png)

---

## Technical Aspects

Anonymous users are limited in certain aspects as they cannot:

- Post comments on the maps and be part of the discussion.
- Export featured maps.
- Delete images - we can't tell whose images they are or who should be allowed to delete them if they were created anonymously.

This allows us to preserve anonymity while preventing vandalism or degradation of content quality, although it does not fully counter [spammy behavior](https://github.com/publiclab/mapknitter/issues/246). 

Some potential but complex features that could help enhance this are:

- [Edit history for maps and images](https://github.com/publiclab/mapknitter/issues/463#issuecomment-478184881) - Registered users could then **revert** changes made by anonymous ones if they are not useful. Building this type of log would be a valuable feature as it would allow some form of **quality control** on user submissions.

- [Edit permissions](https://github.com/publiclab/mapknitter/issues/84#issuecomment-510123139) - Restrictions on who can edit or delete maps are already in use but developing this feature could be useful.

- [Review before maps are posted](https://github.com/publiclab/mapknitter/issues/1029) - This would make submissions from anonymous or first time posters require moderation before being approved and public.

---

Thanks for reading this and helping us make these tools better as a community. Check out [these issues](https://github.com/publiclab/mapknitter/issues?page=1&q=is%3Aissue+anonymous&utf8=%E2%9C%93) if you want to participate in the amelioration of this feature and please edit this document and make a pull request if you've noticed anything relevant that should be added.

Happy coding! :+1: :smile:

PaperTrail.serializer = PaperTrail::Serializers::JSON

# https://github.com/paper-trail-gem/paper_trail#2e-limiting-the-number-of-versions-created
# Limit: 21 versions per record (20 most recent, plus a `create` event)
PaperTrail.config.version_limit = 20
